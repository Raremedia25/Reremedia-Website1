import { cloudinaryStorageAdapter } from "./cloudinary";
import { localStorageAdapter } from "./local";
import { netlifyBlobsStorageAdapter } from "./netlify-blobs";
import type { StorageAdapter } from "./types";

export type { StorageAdapter, StoredObject } from "./types";

/** Pick the configured storage provider (STORAGE_PROVIDER=local|cloudinary|netlify-blobs). */
export function getStorage(): StorageAdapter {
  const provider = (process.env.STORAGE_PROVIDER ?? "local").toLowerCase();
  switch (provider) {
    case "cloudinary":
      return cloudinaryStorageAdapter;
    case "netlify-blobs":
    case "netlify":
      return netlifyBlobsStorageAdapter;
    case "local":
    default:
      return localStorageAdapter;
  }
}

/** Resolve an adapter by name (used when deleting media uploaded under another provider). */
export function storageByName(name: string): StorageAdapter {
  if (name === "cloudinary") return cloudinaryStorageAdapter;
  if (name === "netlify-blobs" || name === "netlify") return netlifyBlobsStorageAdapter;
  return localStorageAdapter;
}
