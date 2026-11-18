import type { ImageSource } from "@/lib/media/image-src";
import { cn } from "@/lib/utils";
import { ResponsiveImage } from "./ResponsiveImage";

/**
 * Card artwork for a project: the system's real interface shown on a laptop,
 * with the phone view beside it when one exists. Falls back to a plain cover
 * image for projects that have no interface screenshot yet.
 */
export function InterfacePreview({ desktop, mobile, cover, accent = "#6d28d9", priority = false, className }: { desktop: ImageSource | null; mobile?: ImageSource | null; cover?: ImageSource | null; accent?: string; priority?: boolean; className?: string }) {
  if (!desktop) {
    return <ResponsiveImage image={cover ?? null} className={cn("aspect-[16/10]", className)} sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" priority={priority} />;
  }
  const loading = priority ? "eager" : "lazy";
  return (
    <div className={cn("relative aspect-[16/10] overflow-hidden", className)} style={{ background: `radial-gradient(120% 90% at 80% 0%, ${accent}55 0%, transparent 60%), linear-gradient(135deg, #0c0a1d 0%, #1f1a45 100%)` }}>
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden="true" />
      {/* Laptop */}
      <div className={cn("absolute top-[11%] transition-transform duration-500 group-hover:-translate-y-1", mobile ? "left-[6%] w-[76%]" : "left-[9%] w-[82%]")}>
        <div className="rounded-t-[10px] border-[5px] border-b-0 border-[#1b1b22] bg-[#1b1b22] shadow-2xl shadow-black/50">
          <div className="aspect-[16/10] overflow-hidden rounded-[4px] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={desktop.url} srcSet={desktop.srcSet || undefined} sizes={desktop.srcSet ? "(min-width: 1280px) 28vw, (min-width: 640px) 40vw, 80vw" : undefined} alt={desktop.alt} loading={loading} decoding="async" className="h-full w-full object-cover object-left-top" />
          </div>
        </div>
        <div className="relative -mx-[6%] h-[9px] rounded-b-[10px] bg-gradient-to-b from-[#d9dbe3] to-[#9a9dab]">
          <div className="absolute left-1/2 top-0 h-[3px] w-[16%] -translate-x-1/2 rounded-b bg-[#7d8090]" />
        </div>
      </div>
      {/* Phone */}
      {mobile && (
        <div className="absolute bottom-[7%] right-[6%] w-[19%] rounded-[14px] border-[4px] border-[#1b1b22] bg-[#1b1b22] shadow-2xl shadow-black/60 transition-transform duration-500 group-hover:-translate-y-2">
          <div className="aspect-[9/18] overflow-hidden rounded-[9px] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mobile.url} alt={mobile.alt} loading={loading} decoding="async" className="h-full w-full object-cover object-top" />
          </div>
        </div>
      )}
    </div>
  );
}
