import type { ImageSource } from "@/lib/media/image-src";
import { cn } from "@/lib/utils";

/**
 * Renders an optimised, lazy-loaded image from a Media record using
 * the generated WebP variants (srcset) and a blur placeholder background.
 */
export function ResponsiveImage({
  image,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className,
  imgClassName,
  priority = false,
  fit = "cover",
  alt,
}: {
  image: ImageSource | null;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  alt?: string;
}) {
  if (!image) return <ImagePlaceholder className={className} />;
  return (
    <div
      className={cn("relative overflow-hidden bg-ink-100", className)}
      style={image.blurDataUrl ? { backgroundImage: `url(${image.blurDataUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        srcSet={image.srcSet || undefined}
        sizes={image.srcSet ? sizes : undefined}
        alt={alt ?? image.alt}
        width={image.width ?? undefined}
        height={image.height ?? undefined}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        className={cn("h-full w-full", fit === "cover" ? "object-cover" : "object-contain", imgClassName)}
      />
    </div>
  );
}

export function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br from-night-800 via-night-700 to-brand-900", className)} aria-hidden="true">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-4xl font-extrabold text-white/20">R</span>
      </div>
    </div>
  );
}
