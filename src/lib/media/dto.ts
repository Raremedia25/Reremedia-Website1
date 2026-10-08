import type { Media } from "@prisma/client";
import { parseJson } from "@/lib/json";
import type { MediaVariant } from "./process";

/** Serialisable media summary for client components (admin pickers, galleries). */
export interface MediaDTO {
  id: string;
  thumbUrl: string;
  url: string;
  alt: string;
  caption: string;
  originalName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  size: number;
  folder: string;
  isDemo: boolean;
  createdAt: string;
}

export function toMediaDTO(m: Media): MediaDTO {
  const variants = parseJson<MediaVariant[]>(m.variants, []);
  const thumb = variants.find((v) => v.width >= 480) ?? variants[0];
  return {
    id: m.id,
    thumbUrl: thumb?.url ?? m.url,
    url: m.url,
    alt: m.alt,
    caption: m.caption,
    originalName: m.originalName,
    mimeType: m.mimeType,
    width: m.width,
    height: m.height,
    size: m.size,
    folder: m.folder,
    isDemo: m.isDemo,
    createdAt: m.createdAt.toISOString(),
  };
}
