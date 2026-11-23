import { del, get, put } from "@vercel/blob";
import type { StorageAdapter, StoredObject } from "./types";

/**
 * Vercel Blob adapter. Needs BLOB_READ_WRITE_TOKEN, which Vercel adds to the
 * project when a Blob store is connected to it. Files are served through the
 * /uploads/[...path] route handler, like the local adapter, so media URLs
 * stay the same whichever provider holds the bytes.
 */
export async function readVercelBlob(key: string) {
  const result = await get(key, { access: "public" });
  return result && result.statusCode === 200 ? result : null;
}

export const vercelBlobStorageAdapter: StorageAdapter = {
  name: "vercel-blob",
  async put(key, data, contentType): Promise<StoredObject> {
    // Keys are random, so a suffix is unnecessary; overwriting keeps "replace image" working.
    await put(key, data, { access: "public", contentType, addRandomSuffix: false, allowOverwrite: true });
    return { key, url: this.urlFor(key) };
  },
  async delete(key) {
    await del(key);
  },
  urlFor(key) {
    return `/uploads/${key.replace(/\\/g, "/")}`;
  },
};
