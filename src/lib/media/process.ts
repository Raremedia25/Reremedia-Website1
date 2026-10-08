import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import { IMAGE_MIME_TYPES, IMAGE_VARIANT_WIDTHS } from "@/lib/constants";
import { getStorage, storageByName } from "@/lib/storage";
import { parseJson } from "@/lib/json";

export interface MediaVariant {
  width: number;
  height: number;
  url: string;
  key: string;
  format: "webp";
}

export interface ProcessedUpload {
  storageKey: string;
  url: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  variants: MediaVariant[];
  blurDataUrl: string | null;
}

const MAX_DIMENSION = 4000;

function randomName(): string {
  return `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}`;
}

function folderPath(folder: string): string {
  const safe = folder.toLowerCase().replace(/[^a-z0-9-_]/g, "") || "general";
  const d = new Date();
  return `${safe}/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function isImageMime(mime: string): boolean {
  return (IMAGE_MIME_TYPES as readonly string[]).includes(mime);
}

export function maxUploadBytes(): number {
  const mb = Number(process.env.MAX_UPLOAD_MB ?? 10);
  return (Number.isFinite(mb) && mb > 0 ? mb : 10) * 1024 * 1024;
}

/**
 * Validate, optimise and store an uploaded image. The original is re-encoded
 * (stripping metadata, capping dimensions) and responsive WebP variants are
 * generated for fast delivery. Returns everything needed for a Media row.
 */
export async function processAndStoreImage(input: Buffer, mimeType: string, folder: string): Promise<ProcessedUpload> {
  if (!isImageMime(mimeType)) throw new Error("Unsupported image type. Use JPG, PNG or WebP.");
  if (input.length > maxUploadBytes()) throw new Error(`Image is larger than ${process.env.MAX_UPLOAD_MB ?? 10} MB.`);

  // Verify the bytes really are an image (do not trust the client's MIME type).
  const probe = sharp(input, { failOn: "error" });
  const meta = await probe.metadata();
  if (!meta.width || !meta.height || !meta.format || !["jpeg", "png", "webp"].includes(meta.format)) {
    throw new Error("The file is not a valid JPG, PNG or WebP image.");
  }

  const storage = getStorage();
  const base = `${folderPath(folder)}/${randomName()}`;
  const hasAlpha = meta.hasAlpha === true;

  // Optimised "original": keep PNG for transparency, otherwise JPEG/WebP.
  const originalFormat = hasAlpha && meta.format === "png" ? "png" : meta.format === "webp" ? "webp" : "jpeg";
  const originalPipeline = sharp(input).rotate().resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true });
  const originalBuffer =
    originalFormat === "png"
      ? await originalPipeline.png({ compressionLevel: 9, palette: false }).toBuffer()
      : originalFormat === "webp"
        ? await originalPipeline.webp({ quality: 85 }).toBuffer()
        : await originalPipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  const originalMeta = await sharp(originalBuffer).metadata();
  const originalExt = originalFormat === "jpeg" ? "jpg" : originalFormat;
  const originalMime = originalFormat === "jpeg" ? "image/jpeg" : `image/${originalFormat}`;

  const stored = await storage.put(`${base}.${originalExt}`, originalBuffer, originalMime);

  // Responsive WebP variants (never upscale).
  const variants: MediaVariant[] = [];
  for (const width of IMAGE_VARIANT_WIDTHS) {
    if ((originalMeta.width ?? 0) < width && variants.length > 0) break;
    const buf = await sharp(originalBuffer).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    const m = await sharp(buf).metadata();
    const key = `${base}-w${width}.webp`;
    const put = await storage.put(key, buf, "image/webp");
    variants.push({ width: m.width ?? width, height: m.height ?? 0, url: put.url, key: put.key, format: "webp" });
    if ((originalMeta.width ?? 0) <= width) break;
  }

  // Tiny blurred placeholder for progressive loading.
  const blur = await sharp(originalBuffer).resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  const blurDataUrl = `data:image/webp;base64,${blur.toString("base64")}`;

  return {
    storageKey: stored.key,
    url: stored.url,
    mimeType: originalMime,
    size: originalBuffer.length,
    width: originalMeta.width ?? null,
    height: originalMeta.height ?? null,
    variants,
    blurDataUrl,
  };
}

/** Store a non-image attachment (e.g. PDF) without processing. */
export async function storeAttachment(input: Buffer, mimeType: string, folder: string, ext: string) {
  if (input.length > maxUploadBytes()) throw new Error(`File is larger than ${process.env.MAX_UPLOAD_MB ?? 10} MB.`);
  const storage = getStorage();
  const key = `${folderPath(folder)}/${randomName()}.${ext.replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
  const stored = await storage.put(key, input, mimeType);
  return { storageKey: stored.key, url: stored.url, mimeType, size: input.length };
}

/** Delete a media row and every stored binary that belongs to it. */
export async function deleteMediaCompletely(mediaId: string) {
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) return;
  const storage = storageByName(media.provider);
  const variants = parseJson<MediaVariant[]>(media.variants, []);
  await Promise.allSettled([storage.delete(media.storageKey), ...variants.map((v) => storage.delete(v.key))]);
  await prisma.media.delete({ where: { id: mediaId } });
}
