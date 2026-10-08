import { promises as fs } from "node:fs";
import path from "node:path";
import type { StorageAdapter, StoredObject } from "./types";

/**
 * Local-disk adapter. Files are written under UPLOADS_DIR (default
 * ./storage/uploads) and served through the /uploads/[...path] route handler,
 * which means uploads keep working in production (`next start`) where files
 * added to /public after build would not be served.
 */
export function uploadsRoot(): string {
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOADS_DIR ?? "./storage/uploads");
}

function safeJoin(root: string, key: string): string {
  const target = path.resolve(root, key.replace(/^[/\\]+/, ""));
  if (!target.startsWith(root + path.sep) && target !== root) {
    throw new Error("Invalid storage key.");
  }
  return target;
}

export const localStorageAdapter: StorageAdapter = {
  name: "local",
  async put(key, data): Promise<StoredObject> {
    const root = uploadsRoot();
    const target = safeJoin(root, key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, data);
    return { key, url: this.urlFor(key) };
  },
  async delete(key) {
    const target = safeJoin(uploadsRoot(), key);
    try {
      await fs.unlink(target);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  },
  urlFor(key) {
    return `/uploads/${key.split(path.sep).join("/")}`;
  },
};

export function resolveLocalFile(key: string): string {
  return safeJoin(uploadsRoot(), key);
}
