"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ImageSource } from "@/lib/media/image-src";
import { cn } from "@/lib/utils";

export interface LightboxItem {
  image: ImageSource;
  caption?: string | null;
  title?: string;
  href?: string;
}

/**
 * Accessible lightbox with keyboard navigation (←/→/Esc) and touch swipe.
 */
export function Lightbox({ items, index, onClose, onNavigate }: { items: LightboxItem[]; index: number | null; onClose: () => void; onNavigate: (i: number) => void }) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const open = index !== null && items[index] !== undefined;

  const prev = useCallback(() => {
    if (index === null) return;
    onNavigate((index - 1 + items.length) % items.length);
  }, [index, items.length, onNavigate]);
  const next = useCallback(() => {
    if (index === null) return;
    onNavigate((index + 1) % items.length);
  }, [index, items.length, onNavigate]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, prev, next]);

  if (!open || index === null) return null;
  const item = items[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title ?? item.image.alt ?? "Image preview"}
      className="fixed inset-0 z-[100] bg-night-950/95 backdrop-blur-sm flex flex-col"
      onClick={onClose}
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart === null) return;
        const dx = e.changedTouches[0].clientX - touchStart;
        if (dx > 50) prev();
        if (dx < -50) next();
        setTouchStart(null);
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white" onClick={(e) => e.stopPropagation()}>
        <span className="text-sm text-ink-300">
          {index + 1} / {items.length}
        </span>
        <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex-1 flex items-center justify-center px-2 sm:px-16" onClick={(e) => e.stopPropagation()}>
        {items.length > 1 && (
          <button type="button" onClick={prev} className="absolute left-2 sm:left-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Previous image">
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={item.image.id}
          src={item.image.url}
          srcSet={item.image.srcSet || undefined}
          sizes="100vw"
          alt={item.image.alt}
          className={cn("max-h-[70vh] max-w-full rounded-xl object-contain shadow-2xl animate-fade-up")}
          style={{ animationDuration: "0.3s" }}
        />
        {items.length > 1 && (
          <button type="button" onClick={next} className="absolute right-2 sm:right-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Next image">
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="px-4 py-4 text-center text-white" onClick={(e) => e.stopPropagation()}>
        {item.title && (
          <p className="font-display font-semibold">
            {item.href ? (
              <Link href={item.href} className="hover:underline underline-offset-4">
                {item.title}
              </Link>
            ) : (
              item.title
            )}
          </p>
        )}
        {(item.caption || item.image.caption) && <p className="mt-1 text-sm text-ink-300">{item.caption || item.image.caption}</p>}
        {item.image.isDemo && <p className="mt-1 text-xs text-amber-300">Demo image</p>}
      </div>
    </div>
  );
}
