"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, ImagePlus, RefreshCw, Star, X } from "lucide-react";
import { MEDIA_SOURCES, MEDIA_SOURCE_LABELS, type MediaSource, type ProjectImageKind } from "@/lib/constants";
import type { MediaDTO } from "@/lib/media/dto";
import { cn } from "@/lib/utils";
import { MediaPicker } from "./MediaPicker";

export interface GalleryItem {
  media: MediaDTO;
  caption: string;
  /** Present for project galleries: screenshot of the software or a photo/illustration. */
  kind?: ProjectImageKind;
}

/**
 * Manages an ordered image gallery: add from library/upload, drag or use
 * arrows to reorder, describe each image, replace or remove it. Serialises to
 * a hidden `gallery` field as JSON [{ mediaId, caption, kind, source }].
 *
 * With `kinds` (projects), every image is filed as a software screenshot or a
 * gallery photo, its origin (uploaded / AI-generated / illustration) can be
 * set, and one image can be picked as the main project image.
 */
export function GalleryManager({ initial, folder, onSetFeatured, featuredId, kinds = false }: { initial: GalleryItem[]; folder: string; onSetFeatured?: (m: MediaDTO) => void; featuredId?: string | null; kinds?: boolean }) {
  const [items, setItems] = useState<GalleryItem[]>(initial);
  const [adding, setAdding] = useState<ProjectImageKind | null>(null);
  const [replacing, setReplacing] = useState<number | null>(null);
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
  const patch = (index: number, change: Partial<GalleryItem>) => setItems((list) => list.map((x, i) => (i === index ? { ...x, ...change } : x)));
  const patchMedia = (index: number, change: Partial<MediaDTO>) => setItems((list) => list.map((x, i) => (i === index ? { ...x, media: { ...x.media, ...change } } : x)));

  const screenshots = items.filter((i) => i.kind === "SCREENSHOT").length;
  const payload = items.map((i) => ({ mediaId: i.media.id, caption: i.caption, ...(kinds ? { kind: i.kind ?? "GALLERY", source: i.media.source } : {}) }));

  return (
    <div>
      <input type="hidden" name="gallery" value={JSON.stringify(payload)} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="label mb-0">{kinds ? `Project images (${screenshots} screenshots, ${items.length - screenshots} gallery)` : `Gallery images (${items.length})`}</span>
        <div className="flex flex-wrap gap-2">
          {kinds && (
            <button type="button" onClick={() => setAdding("SCREENSHOT")} className="btn btn-secondary btn-sm">
              <ImagePlus className="h-4 w-4" /> Add screenshots
            </button>
          )}
          <button type="button" onClick={() => setAdding("GALLERY")} className="btn btn-secondary btn-sm">
            <ImagePlus className="h-4 w-4" /> {kinds ? "Add gallery images" : "Add images"}
          </button>
        </div>
      </div>
      {kinds && <p className="mt-1 text-xs text-ink-500">Screenshots appear under “Software screens” on the project page; gallery images (photos, illustrations) appear under “Gallery”. Drag to change the order.</p>}
      {items.length === 0 ? (
        <button type="button" onClick={() => setAdding("GALLERY")} className="mt-2 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-300 bg-white p-8 text-ink-500 hover:border-brand-400 hover:bg-brand-50/40">
          <ImagePlus className="h-7 w-7" />
          <span className="mt-2 text-sm font-semibold">No images yet. Add some.</span>
        </button>
      ) : (
        <ul className="mt-2 grid gap-3 sm:grid-cols-2">
          {items.map((item, i) => {
            const isMain = !!featuredId && featuredId === item.media.id;
            return (
              <li
                key={item.media.id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) move(dragIndex, i);
                  setDragIndex(null);
                }}
                className={cn("flex gap-3 rounded-2xl border bg-white p-2.5", isMain ? "border-brand-400 ring-2 ring-brand-500/15" : "border-ink-200", dragIndex === i && "opacity-50")}
              >
                <div className="flex flex-col items-center justify-center text-ink-300 cursor-grab" title="Drag to reorder">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="relative h-20 w-28 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.media.thumbUrl} alt={item.media.alt} className="h-20 w-28 rounded-lg object-cover bg-ink-100" />
                  {isMain && <span className="absolute left-1 top-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Main</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <input type="text" value={item.caption} onChange={(e) => patch(i, { caption: e.target.value })} placeholder="Description (optional)" aria-label="Image description" className="input py-1.5 text-sm" maxLength={300} />
                  {kinds && (
                    <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                      <select value={item.kind ?? "GALLERY"} onChange={(e) => patch(i, { kind: e.target.value as ProjectImageKind })} aria-label="Image type" className="input py-1 text-xs">
                        <option value="SCREENSHOT">Screenshot</option>
                        <option value="GALLERY">Gallery image</option>
                      </select>
                      <select value={item.media.source} onChange={(e) => patchMedia(i, { source: e.target.value })} aria-label="Image origin" className="input py-1 text-xs">
                        {MEDIA_SOURCES.map((s) => (
                          <option key={s} value={s}>
                            {MEDIA_SOURCE_LABELS[s as MediaSource]}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded-md border border-ink-200 text-ink-700 disabled:opacity-40" aria-label="Move up">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} className="grid h-7 w-7 place-items-center rounded-md border border-ink-200 text-ink-700 disabled:opacity-40" aria-label="Move down">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    {onSetFeatured && (
                      <button type="button" onClick={() => onSetFeatured(item.media)} disabled={isMain} className="inline-flex h-7 items-center gap-1 rounded-md border border-ink-200 px-2 text-xs text-ink-700 hover:border-brand-300 disabled:border-brand-300 disabled:bg-brand-50 disabled:text-brand-700" title="Use as the main project image">
                        <Star className="h-3.5 w-3.5" /> {isMain ? "Main image" : "Set as main"}
                      </button>
                    )}
                    <button type="button" onClick={() => setReplacing(i)} className="inline-flex h-7 items-center gap-1 rounded-md border border-ink-200 px-2 text-xs text-ink-700 hover:border-brand-300" title="Swap this image for another one, keeping its position and description">
                      <RefreshCw className="h-3.5 w-3.5" /> Replace
                    </button>
                    <button type="button" onClick={() => setItems((list) => list.filter((_, idx) => idx !== i))} className="ml-auto inline-flex h-7 items-center gap-1 rounded-md border border-ink-200 px-2 text-xs text-red-600 hover:border-red-300 hover:bg-red-50" aria-label="Remove from gallery">
                      <X className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <MediaPicker
        open={adding !== null}
        onClose={() => setAdding(null)}
        multiple
        folder={folder}
        title={adding === "SCREENSHOT" ? "Add software screenshots" : "Add gallery images"}
        onSelect={(selected) => {
          const kind = adding ?? "GALLERY";
          setItems((list) => {
            const existing = new Set(list.map((x) => x.media.id));
            return [...list, ...selected.filter((m) => !existing.has(m.id)).map((media) => ({ media, caption: "", ...(kinds ? { kind } : {}) }))];
          });
        }}
      />
      <MediaPicker
        open={replacing !== null}
        onClose={() => setReplacing(null)}
        folder={folder}
        title="Replace image"
        onSelect={(selected) => {
          const media = selected[0];
          const index = replacing;
          if (!media || index === null) return;
          setItems((list) => (list.some((x, idx) => idx !== index && x.media.id === media.id) ? list : list.map((x, idx) => (idx === index ? { ...x, media } : x))));
        }}
      />
    </div>
  );
}
