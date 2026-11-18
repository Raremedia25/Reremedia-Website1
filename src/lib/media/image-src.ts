import type { Media } from "@prisma/client";
import { parseJson } from "@/lib/json";
import type { MediaVariant } from "./process";

/** Shape of media data passed to client components (serialisable subset). */
export interface ImageSource {
  id: string;
  url: string;
  alt: string;
  caption: string;
  width: number | null;
  height: number | null;
  srcSet: string;
  blurDataUrl: string | null;
  isDemo: boolean;
  source: string;
}

export function toImageSource(media: Media | null | undefined): ImageSource | null {
  if (!media) return null;
  const variants = parseJson<MediaVariant[]>(media.variants, []);
  const srcSet = variants
    .filter((v) => v.url && v.width)
    .map((v) => `${v.url} ${v.width}w`)
    .join(", ");
  // Prefer the largest WebP variant as the default src for speed.
  const largest = variants.length ? variants[variants.length - 1] : null;
  return {
    id: media.id,
    url: largest?.url ?? media.url,
    alt: media.alt || "",
    caption: media.caption || "",
    width: media.width,
    height: media.height,
    srcSet,
    blurDataUrl: media.blurDataUrl,
    isDemo: media.isDemo,
    source: media.source,
  };
}

/** Public label for images that are not real photographs or product screenshots. */
export function imageOriginLabel(image: Pick<ImageSource, "isDemo" | "source"> | null | undefined): string | null {
  if (!image) return null;
  if (image.source === "AI_GENERATED") return "AI-generated image";
  if (image.source === "ILLUSTRATION") return "Illustration";
  if (image.isDemo) return "Demo image";
  return null;
}

/** Pick a reasonably small variant URL for thumbnails/OG images. */
export function variantUrl(media: Media | null | undefined, minWidth = 960): string | null {
  if (!media) return null;
  const variants = parseJson<MediaVariant[]>(media.variants, []);
  const pick = variants.find((v) => v.width >= minWidth) ?? variants[variants.length - 1];
  return pick?.url ?? media.url;
}
