"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import type { ImageSource } from "@/lib/media/image-src";
import { cn } from "@/lib/utils";
import { Lightbox } from "./Lightbox";

export interface ScreenItem {
  image: ImageSource;
  label: string;
  /** Extra line under the label, e.g. where the screen comes from. */
  note?: string;
  mobile?: boolean;
}

/**
 * Software screenshots presented in window frames (phone frame for mobile
 * captures). Clicking one opens it full-size in the lightbox.
 */
export function ScreenGallery({ items, title, className }: { items: ScreenItem[]; title: string; className?: string }) {
  const [index, setIndex] = useState<number | null>(null);
  if (items.length === 0) return null;
  return (
    <>
      <ul className={cn("grid gap-4 sm:grid-cols-2", className)}>
        {items.map((item, i) => (
          <li key={item.image.id}>
            <button type="button" onClick={() => setIndex(i)} className="group block w-full overflow-hidden rounded-2xl border border-ink-200 bg-white text-left shadow-card card-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30" aria-label={`Open ${item.label} screen`}>
              <span className="flex items-center gap-1.5 border-b border-ink-200 bg-ink-50 px-3 py-2" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <span className="ml-2 truncate text-[11px] font-medium text-ink-500">{item.label}</span>
                <Maximize2 className="ml-auto h-3.5 w-3.5 text-ink-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
              <span className={cn("block aspect-[16/10] overflow-hidden", item.mobile ? "bg-night-900 p-3" : "bg-ink-100")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image.url}
                  srcSet={item.image.srcSet || undefined}
                  sizes={item.image.srcSet ? "(min-width: 640px) 40vw, 100vw" : undefined}
                  alt={item.image.alt}
                  loading="lazy"
                  decoding="async"
                  className={cn("transition-transform duration-500 group-hover:scale-[1.03]", item.mobile ? "mx-auto h-full w-auto rounded-xl object-cover object-top" : "h-full w-full object-cover object-top")}
                />
              </span>
              <span className="block p-3.5">
                <span className="block font-display text-sm font-semibold text-ink-900">{item.label}</span>
                {item.note && <span className="mt-0.5 block text-xs text-ink-500">{item.note}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Lightbox items={items.map((i) => ({ image: i.image, title: `${title} · ${i.label}`, caption: i.note }))} index={index} onClose={() => setIndex(null)} onNavigate={setIndex} />
    </>
  );
}
