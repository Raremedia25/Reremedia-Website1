import { getStore, type Store } from "@netlify/blobs";
import type { StorageAdapter, StoredObject } from "./types";

/**
 * Netlify Blobs adapter. Inside Netlify Functions the store is configured
 * automatically; elsewhere (seeding from a laptop) set NETLIFY_SITE_ID and
 * NETLIFY_API_TOKEN (a personal access token). Files are served through the
 * /uploads/[...path] route handler, like the local adapter.
 */
export const BLOB_STORE_NAME = "media";

export function blobStore(): Store {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_API_TOKEN;
  return siteID && token
    ? getStore({ name: BLOB_STORE_NAME, siteID, token, consistency: "strong" })
    : getStore({ name: BLOB_STORE_NAME, consistency: "strong" });
}

export const netlifyBlobsStorageAdapter: StorageAdapter = {
  name: "netlify-blobs",
  async put(key, data, contentType): Promise<StoredObject> {
    await blobStore().set(key, new Blob([new Uint8Array(data)], { type: contentType }), { metadata: { contentType } });
    return { key, url: this.urlFor(key) };
  },
  async delete(key) {
    await blobStore().delete(key);
  },
  urlFor(key) {
    return `/uploads/${key.replace(/\\/g, "/")}`;
  },
};
