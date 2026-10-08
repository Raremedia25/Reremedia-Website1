"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, ImagePlus, Star, X } from "lucide-react";
import type { MediaDTO } from "@/lib/media/dto";
import { cn } from "@/lib/utils";
import { MediaPicker } from "./MediaPicker";

export interface GalleryItem {
  media: MediaDTO;
  caption: string;
}

/**
 * Manages an ordered image gallery: add from library/upload, drag or use
 * arrows to reorder, caption each image, remove. Serialises to a hidden
 * `gallery` field as JSON [{ mediaId, caption }].
 */
export function GalleryManager({ initial, folder, onSetFeatured }: { initial: GalleryItem[]; folder: string; onSetFeatured?: (m: MediaDTO) => void }) {
  const [items, setItems] = useState<GalleryItem[]>(initial);
  const [open, setOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    setItems((list) => {
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  return (
    <div>
      <input type="hidden" name="gallery" value={JSON.stringify(items.map((i) => ({ mediaId: i.media.id, caption: i.caption })))} />
      <div className="flex items-center justify-between">
        <span className="label mb-0">Gallery images ({items.length})</span>
        <button type="button" onClick={() => setOpen(true)} className="btn btn-secondary btn-sm">
          <ImagePlus className="h-4 w-4" /> Add images
        </button>
      </div>
      {items.length === 0 ? (
        <button type="button" onClick={() => setOpen(true)} className="mt-2 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-300 bg-white p-8 text-ink-500 hover:border-brand-400 hover:bg-brand-50/40">
          <ImagePlus className="h-7 w-7" />
          <span className="mt-2 text-sm font-semibold">No gallery images yet. Add some.</span>
        </button>
      ) : (
        <ul className="mt-2 grid gap-3 sm:grid-cols-2">
          {items.map((item, i) => (
            <li
              key={item.media.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) move(dragIndex, i);
                setDragIndex(null);
              }}
              className={cn("flex gap-3 rounded-2xl border border-ink-200 bg-white p-2.5", dragIndex === i && "opacity-50")}
            >
              <div className="flex flex-col items-center justify-center text-ink-300 cursor-grab" title="Drag to reorder">
                <GripVertical className="h-4 w-4" />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.media.thumbUrl} alt={item.media.alt} className="h-20 w-28 shrink-0 rounded-lg object-cover bg-ink-100" />
              <div className="min-w-0 flex-1">
                <input
                  type="text"
                  value={item.caption}
                  onChange={(e) => setItems((list) => list.map((x, idx) => (idx === i ? { ...x, caption: e.target.value } : x)))}
                  placeholder="Caption (optional)"
                  className="input py-1.5 text-sm"
                  maxLength={300}
                />
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded-md border border-ink-200 text-ink-700 disabled:opacity-40" aria-label="Move up">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} className="grid h-7 w-7 place-items-center rounded-md border border-ink-200 text-ink-700 disabled:opacity-40" aria-label="Move down">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  {onSetFeatured && (
                    <button type="button" onClick={() => onSetFeatured(item.media)} className="inline-flex h-7 items-center gap-1 rounded-md border border-ink-200 px-2 text-xs text-ink-700 hover:border-brand-300" title="Use as featured image">
                      <Star className="h-3.5 w-3.5" /> Featured
                    </button>
                  )}
                  <button type="button" onClick={() => setItems((list) => list.filter((_, idx) => idx !== i))} className="ml-auto inline-flex h-7 items-center gap-1 rounded-md border border-ink-200 px-2 text-xs text-red-600 hover:border-red-300 hover:bg-red-50" aria-label="Remove from gallery">
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        multiple
        folder={folder}
        title="Add gallery images"
        onSelect={(selected) =>
          setItems((list) => {
            const existing = new Set(list.map((x) => x.media.id));
            return [...list, ...selected.filter((m) => !existing.has(m.id)).map((media) => ({ media, caption: "" }))];
          })
        }
      />
    </div>
  );
}
