/**
 * Storage adapter contract. Media binaries live in a storage provider
 * (local disk, Cloudinary, S3-compatible…); only metadata and URLs are
 * stored in the database. Implement this interface to add a provider.
 */
export interface StoredObject {
  /** Provider-specific key used to delete/replace the object later. */
  key: string;
  /** Public URL where the object can be fetched. */
  url: string;
}

export interface StorageAdapter {
  readonly name: string;
  put(key: string, data: Buffer, contentType: string): Promise<StoredObject>;
  delete(key: string): Promise<void>;
  /** Public URL for a key (for providers that derive URLs from keys). */
  urlFor(key: string): string;
}
