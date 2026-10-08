"use client";

import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import type { MediaDTO } from "@/lib/media/dto";
import { MediaPicker } from "./MediaPicker";

export function FeaturedImageField({ name = "featuredImageId", initial, folder, label = "Featured image" }: { name?: string; initial: MediaDTO | null; folder: string; label?: string }) {
  const [image, setImage] = useState<MediaDTO | null>(initial);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={image?.id ?? ""} />
      {image ? (
        <div className="relative overflow-hidden rounded-2xl border border-ink-200 bg-ink-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.thumbUrl} alt={image.alt} className="aspect-[16/10] w-full object-cover" />
          <div className="flex items-center justify-between gap-2 p-2.5">
            <span className="truncate text-xs text-ink-700">{image.originalName}</span>
            <div className="flex gap-1.5">
              <button type="button" onClick={() => setOpen(true)} className="btn btn-secondary btn-sm">
                Change
              </button>
              <button type="button" onClick={() => setImage(null)} className="btn btn-secondary btn-sm text-red-600" aria-label="Remove featured image">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="flex aspect-[16/10] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-300 bg-white text-ink-500 hover:border-brand-400 hover:bg-brand-50/40">
          <ImagePlus className="h-7 w-7" />
          <span className="mt-2 text-sm font-semibold">Choose or upload</span>
        </button>
      )}
      <MediaPicker open={open} onClose={() => setOpen(false)} onSelect={(items) => setImage(items[0] ?? null)} folder={folder} />
    </div>
  );
}
