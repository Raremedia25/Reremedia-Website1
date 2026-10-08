import { createHash } from "node:crypto";
import type { StorageAdapter, StoredObject } from "./types";

/**
 * Cloudinary adapter using the signed REST upload API (no SDK needed).
 * Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.
 */
function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.");
  }
  return { cloudName, apiKey, apiSecret, folder: process.env.CLOUDINARY_FOLDER || "rramedia" };
}

function sign(params: Record<string, string>, secret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(`${toSign}${secret}`).digest("hex");
}

function publicIdFromKey(key: string): string {
  return key.replace(/\.[a-z0-9]+$/i, "");
}

export const cloudinaryStorageAdapter: StorageAdapter = {
  name: "cloudinary",
  async put(key, data, contentType): Promise<StoredObject> {
    const { cloudName, apiKey, apiSecret, folder } = config();
    const publicId = publicIdFromKey(key);
    const timestamp = String(Math.floor(Date.now() / 1000));
    const params = { folder, public_id: publicId, timestamp };
    const signature = sign(params, apiSecret);

    const form = new FormData();
    form.set("file", new Blob([new Uint8Array(data)], { type: contentType }));
    form.set("api_key", apiKey);
    form.set("timestamp", timestamp);
    form.set("folder", folder);
    form.set("public_id", publicId);
    form.set("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form });
    if (!res.ok) throw new Error(`Cloudinary upload failed (${res.status}): ${await res.text()}`);
    const json = (await res.json()) as { secure_url: string; public_id: string };
    return { key: json.public_id, url: json.secure_url };
  },
  async delete(key) {
    const { cloudName, apiKey, apiSecret } = config();
    const timestamp = String(Math.floor(Date.now() / 1000));
    const params = { public_id: key, timestamp };
    const signature = sign(params, apiSecret);
    const form = new FormData();
    form.set("public_id", key);
    form.set("api_key", apiKey);
    form.set("timestamp", timestamp);
    form.set("signature", signature);
    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: "POST", body: form });
  },
  urlFor(key) {
    const { cloudName } = config();
    return `https://res.cloudinary.com/${cloudName}/image/upload/${key}`;
  },
};
