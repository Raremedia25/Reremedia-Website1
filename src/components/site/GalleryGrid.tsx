"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lightbox, type LightboxItem } from "./Lightbox";
import { ResponsiveImage } from "./ResponsiveImage";

/**
 * Image grid that opens a lightbox. Used by the public portfolio gallery
 * and project detail pages.
 */
export function GalleryGrid({ items, columns = 3, showTitles = false, className }: { items: LightboxItem[]; columns?: 2 | 3 | 4; showTitles?: boolean; className?: string }) {
  const [index, setIndex] = useState<number | null>(null);

  if (items.length === 0) return null;
  const cols = columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <>
      <ul className={cn("grid gap-4", cols, className)}>
        {items.map((item, i) => (
          <li key={item.image.id} className="group relative">
            <button type="button" onClick={() => setIndex(i)} className="block w-full overflow-hidden rounded-2xl border border-ink-200 bg-white text-left shadow-card card-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30" aria-label={`Open ${item.title ?? item.image.alt ?? "image"}`}>
              <ResponsiveImage image={item.image} className="aspect-[4/3]" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" imgClassName="transition-transform duration-500 group-hover:scale-[1.04]" />
              <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-night-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Maximize2 className="h-4 w-4" />
              </span>
              {item.image.isDemo && <span className="absolute left-3 top-3 chip bg-amber-100 text-amber-800">Demo image</span>}
              {(showTitles || item.caption || item.image.caption) && (
                <span className="block p-3.5">
                  {showTitles && item.title && <span className="block font-display text-sm font-semibold text-ink-900">{item.title}</span>}
                  {(item.caption || item.image.caption) && <span className="block text-xs text-ink-500 mt-0.5 line-clamp-2">{item.caption || item.image.caption}</span>}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <Lightbox items={items} index={index} onClose={() => setIndex(null)} onNavigate={setIndex} />
    </>
  );
}
