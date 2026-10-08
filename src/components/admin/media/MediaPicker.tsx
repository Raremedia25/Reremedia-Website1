"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Search, X } from "lucide-react";
import type { MediaDTO } from "@/lib/media/dto";
import { cn } from "@/lib/utils";
import { Uploader } from "./Uploader";

/**
 * Modal that lets an admin choose one or many images from the library or
 * upload new ones on the spot.
 */
export function MediaPicker({ open, onClose, onSelect, multiple = false, folder = "general", title = "Choose image" }: { open: boolean; onClose: () => void; onSelect: (items: MediaDTO[]) => void; multiple?: boolean; folder?: string; title?: string }) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [items, setItems] = useState<MediaDTO[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Record<string, MediaDTO>>({});

  const load = useCallback(async (query: string, p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media?q=${encodeURIComponent(query)}&page=${p}`);
      const json = await res.json();
      setItems(json.items ?? []);
      setPages(json.pages ?? 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setSelected({});
    setTab("library");
    load(q, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => load(q, page), 250);
    return () => clearTimeout(t);
  }, [q, page, open, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (m: MediaDTO) => {
    if (!multiple) {
      onSelect([m]);
      onClose();
      return;
    }
    setSelected((s) => {
      const n = { ...s };
      if (n[m.id]) delete n[m.id];
      else n[m.id] = m;
      return n;
    });
  };
  const count = Object.keys(selected).length;

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[90] flex items-end justify-center bg-night-950/70 p-0 sm:items-center sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
          <div className="flex items-center gap-1 rounded-full bg-ink-100 p-1">
            {(["library", "upload"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={cn("rounded-full px-4 py-1.5 text-sm font-semibold capitalize", tab === t ? "bg-white shadow text-ink-900" : "text-ink-500")}>
                {t}
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === "upload" ? (
            <Uploader
              folder={folder}
              onUploaded={(uploaded) => {
                if (multiple) {
                  setSelected((s) => ({ ...s, ...Object.fromEntries(uploaded.map((u) => [u.id, u])) }));
                  setTab("library");
                  setPage(1);
                  load(q, 1);
                } else {
                  onSelect([uploaded[0]]);
                  onClose();
                }
              }}
            />
          ) : (
            <>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by file name, alt text or caption…"
                  className="input pl-10"
                />
              </div>
              {loading ? (
                <div className="grid place-items-center py-16 text-ink-500">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <p className="py-16 text-center text-sm text-ink-500">No images found. Switch to the Upload tab to add some.</p>
              ) : (
                <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {items.map((m) => {
                    const isSel = !!selected[m.id];
                    return (
                      <li key={m.id}>
                        <button type="button" onClick={() => toggle(m)} className={cn("group relative block w-full overflow-hidden rounded-xl border-2 bg-ink-50 text-left", isSel ? "border-brand-600" : "border-transparent hover:border-brand-300")} title={m.originalName}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.thumbUrl} alt={m.alt} className="aspect-square w-full object-cover" loading="lazy" />
                          {isSel && (
                            <span className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-white">
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                          <span className="block truncate px-1.5 py-1 text-[11px] text-ink-700">{m.originalName}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {pages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn btn-secondary btn-sm">
                    Previous
                  </button>
                  <span className="self-center text-sm text-ink-500">
                    {page} / {pages}
                  </span>
                  <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="btn btn-secondary btn-sm">
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {multiple && (
          <div className="flex items-center justify-between border-t border-ink-200 px-5 py-3">
            <span className="text-sm text-ink-500">{count} selected</span>
            <button
              type="button"
              disabled={count === 0}
              onClick={() => {
                onSelect(Object.values(selected));
                onClose();
              }}
              className="btn btn-primary btn-sm"
            >
              Add {count > 0 ? count : ""} image{count === 1 ? "" : "s"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
