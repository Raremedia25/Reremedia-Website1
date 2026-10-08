"use client";

import { useCallback, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, UploadCloud, X, XCircle } from "lucide-react";
import type { MediaDTO } from "@/lib/media/dto";
import { cn, formatBytes } from "@/lib/utils";

interface Pending {
  id: string;
  file: File;
  preview: string;
  status: "queued" | "uploading" | "done" | "error";
  error?: string;
}

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

/**
 * Drag-and-drop multi-image uploader with previews and per-file status.
 * Uploads go to /api/admin/media; successfully created media are reported
 * through `onUploaded`.
 */
export function Uploader({ folder = "general", onUploaded, compact = false, className }: { folder?: string; onUploaded?: (items: MediaDTO[]) => void; compact?: boolean; className?: string }) {
  const [queue, setQueue] = useState<Pending[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const next: Pending[] = [];
    for (const file of Array.from(files)) {
      if (!ACCEPT.includes(file.type)) {
        next.push({ id: crypto.randomUUID(), file, preview: "", status: "error", error: "Unsupported type (use JPG, PNG or WebP)" });
        continue;
      }
      next.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), status: "queued" });
    }
    setQueue((q) => [...q, ...next]);
  }, []);

  const remove = (id: string) =>
    setQueue((q) => {
      const item = q.find((x) => x.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return q.filter((x) => x.id !== id);
    });

  const upload = async () => {
    const items = queue.filter((q) => q.status === "queued");
    if (!items.length) return;
    setBusy(true);
    const uploaded: MediaDTO[] = [];
    // Upload in small batches so progress is visible and a single failure
    // does not abort the rest.
    for (const item of items) {
      setQueue((q) => q.map((x) => (x.id === item.id ? { ...x, status: "uploading" } : x)));
      const body = new FormData();
      body.set("folder", folder);
      body.append("files", item.file);
      try {
        const res = await fetch("/api/admin/media", { method: "POST", body });
        const json = await res.json();
        if (!res.ok || !json.items?.length) {
          const msg = json.failed?.[0]?.error ?? json.error ?? "Upload failed";
          setQueue((q) => q.map((x) => (x.id === item.id ? { ...x, status: "error", error: msg } : x)));
          continue;
        }
        uploaded.push(...json.items);
        setQueue((q) => q.map((x) => (x.id === item.id ? { ...x, status: "done" } : x)));
      } catch {
        setQueue((q) => q.map((x) => (x.id === item.id ? { ...x, status: "error", error: "Network error" } : x)));
      }
    }
    setBusy(false);
    if (uploaded.length) onUploaded?.(uploaded);
    // Clear completed items after a short delay so the user sees the ticks.
    setTimeout(() => setQueue((q) => q.filter((x) => x.status !== "done")), 1200);
  };

  const queued = queue.filter((q) => q.status === "queued").length;

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-colors",
          compact ? "p-5" : "p-10",
          dragging ? "border-brand-500 bg-brand-50" : "border-ink-300 bg-white hover:border-brand-400 hover:bg-brand-50/40",
        )}
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <UploadCloud className="h-6 w-6" />
        </span>
        <p className="mt-3 text-sm font-semibold text-ink-900">Drag & drop images here, or click to browse</p>
        <p className="mt-1 text-xs text-ink-500">JPG, PNG or WebP · up to {process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 10} MB each · multiple files allowed</p>
        <input ref={inputRef} type="file" accept={ACCEPT.join(",")} multiple className="sr-only" onChange={(e) => e.target.files && addFiles(e.target.files)} />
      </div>

      {queue.length > 0 && (
        <div className="mt-4 space-y-3">
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {queue.map((item) => (
              <li key={item.id} className="relative overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
                {item.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.preview} alt="" className="aspect-square w-full object-cover" />
                ) : (
                  <div className="grid aspect-square place-items-center text-ink-500">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-night-950/70 px-1.5 py-1 text-[10px] text-white truncate">
                  {item.file.name} · {formatBytes(item.file.size)}
                </div>
                <div className="absolute left-1.5 top-1.5">
                  {item.status === "uploading" && <Loader2 className="h-5 w-5 animate-spin text-white drop-shadow" />}
                  {item.status === "done" && <CheckCircle2 className="h-5 w-5 text-emerald-400 drop-shadow" />}
                  {item.status === "error" && <XCircle className="h-5 w-5 text-red-400 drop-shadow" />}
                </div>
                {item.status !== "uploading" && (
                  <button type="button" onClick={() => remove(item.id)} className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-night-950/70 text-white hover:bg-red-600" aria-label="Remove">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {item.error && <p className="px-1.5 py-1 text-[10px] text-red-600 leading-tight">{item.error}</p>}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <button type="button" onClick={upload} disabled={busy || queued === 0} className="btn btn-primary btn-sm">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              Upload {queued > 0 ? `${queued} image${queued > 1 ? "s" : ""}` : ""}
            </button>
            <button type="button" onClick={() => setQueue([])} disabled={busy} className="btn btn-secondary btn-sm">
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
