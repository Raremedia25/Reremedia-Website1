"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Check, Copy, Loader2, RefreshCw, Trash2, X } from "lucide-react";
import { bulkDeleteMediaAction, deleteMediaAction, updateMediaAction } from "@/actions/media";
import type { ActionState } from "@/lib/actions-shared";
import type { MediaDTO } from "@/lib/media/dto";
import { cn, formatBytes, formatDate } from "@/lib/utils";
import { ConfirmButton, Field, FormAlert, SubmitButton } from "../forms";
import { Uploader } from "./Uploader";

export function MediaLibrary({ items, usage, folders, activeFolder, q }: { items: MediaDTO[]; usage: Record<string, number>; folders: Array<{ name: string; count: number }>; activeFolder: string; q: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<MediaDTO | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [uploadFolder, setUploadFolder] = useState(activeFolder || "general");

  useEffect(() => {
    // Keep the side panel in sync with freshly loaded data.
    if (selected) setSelected(items.find((i) => i.id === selected.id) ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const toggleCheck = (id: string) =>
    setChecked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <div className="card p-5">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <label className="text-sm font-semibold text-ink-700">
              Upload to folder{" "}
              <input value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))} className="input ml-2 inline-block w-40 py-1.5 text-sm" placeholder="general" />
            </label>
          </div>
          <Uploader folder={uploadFolder || "general"} compact onUploaded={() => router.refresh()} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            <Link href="/admin/media" className={cn("chip px-3 py-1.5", !activeFolder ? "gradient-brand text-white" : "bg-white border border-ink-200")}>
              All
            </Link>
            {folders.map((f) => (
              <Link key={f.name} href={`/admin/media?folder=${encodeURIComponent(f.name)}`} className={cn("chip px-3 py-1.5", activeFolder === f.name ? "gradient-brand text-white" : "bg-white border border-ink-200")}>
                {f.name} <span className="opacity-70">({f.count})</span>
              </Link>
            ))}
          </div>
          <form action="/admin/media" className="flex gap-2">
            {activeFolder && <input type="hidden" name="folder" value={activeFolder} />}
            <input type="search" name="q" defaultValue={q} placeholder="Search images…" className="input py-1.5 text-sm sm:w-56" />
            <button className="btn btn-secondary btn-sm">Search</button>
          </form>
        </div>

        {checked.size > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm">
            <span className="font-semibold text-brand-800">{checked.size} selected</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setChecked(new Set())} className="btn btn-secondary btn-sm">
                Clear
              </button>
              <form action={bulkDeleteMediaAction}>
                {[...checked].map((id) => (
                  <input key={id} type="hidden" name="ids" value={id} />
                ))}
                <SubmitButton variant="danger" className="btn-sm" pendingText="Deleting…">
                  <Trash2 className="h-4 w-4" /> Delete selected
                </SubmitButton>
              </form>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="card p-12 text-center text-sm text-ink-500">No images here yet. Drag some files into the upload area above.</div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-6">
            {items.map((m) => {
              const isSel = selected?.id === m.id;
              const isChecked = checked.has(m.id);
              const isImage = m.mimeType.startsWith("image/");
              return (
                <li key={m.id} className={cn("group relative overflow-hidden rounded-xl border-2 bg-white", isSel ? "border-brand-600" : "border-ink-200")}>
                  <button type="button" onClick={() => setSelected(m)} className="block w-full text-left">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.thumbUrl} alt={m.alt} className="aspect-square w-full bg-ink-100 object-cover" loading="lazy" />
                    ) : (
                      <div className="grid aspect-square place-items-center bg-ink-100 text-xs font-semibold text-ink-500">{m.mimeType.split("/")[1]?.toUpperCase()}</div>
                    )}
                    <div className="px-2 py-1.5">
                      <p className="truncate text-xs font-medium text-ink-900">{m.originalName}</p>
                      <p className="text-[10px] text-ink-500">
                        {m.width && m.height ? `${m.width}×${m.height} · ` : ""}
                        {formatBytes(m.size)}
                        {usage[m.id] ? ` · used ${usage[m.id]}×` : ""}
                      </p>
                    </div>
                  </button>
                  <label className={cn("absolute left-2 top-2 grid h-6 w-6 cursor-pointer place-items-center rounded-md border bg-white/90 shadow-sm", isChecked ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300 text-transparent group-hover:text-ink-300")}>
                    <input type="checkbox" className="sr-only" checked={isChecked} onChange={() => toggleCheck(m.id)} aria-label={`Select ${m.originalName}`} />
                    <Check className="h-4 w-4" />
                  </label>
                  {m.isDemo && <span className="absolute right-2 top-2 chip bg-amber-100 text-amber-800 text-[10px]">Demo</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        {selected ? <MediaDetails key={selected.id} media={selected} usedIn={usage[selected.id] ?? 0} onClose={() => setSelected(null)} /> : <div className="card p-6 text-sm text-ink-500">Select an image to edit its alt text, caption or folder, replace the file, or delete it.</div>}
      </aside>
    </div>
  );
}

function MediaDetails({ media, usedIn, onClose }: { media: MediaDTO; usedIn: number; onClose: () => void }) {
  const router = useRouter();
  const [state, action] = useActionState<ActionState, FormData>(updateMediaAction.bind(null, media.id), {});
  const [replacing, setReplacing] = useState(false);
  const [replaceError, setReplaceError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const replace = async (file: File) => {
    setReplacing(true);
    setReplaceError("");
    const body = new FormData();
    body.set("file", file);
    try {
      const res = await fetch(`/api/admin/media/${media.id}`, { method: "POST", body });
      const json = await res.json();
      if (!res.ok) setReplaceError(json.error ?? "Replace failed.");
      else router.refresh();
    } catch {
      setReplaceError("Network error.");
    } finally {
      setReplacing(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="relative bg-ink-100">
        {media.mimeType.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.thumbUrl} alt={media.alt} className="max-h-64 w-full object-contain" />
        ) : (
          <div className="grid h-40 place-items-center text-sm text-ink-500">{media.mimeType}</div>
        )}
        <button type="button" onClick={onClose} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow hover:bg-white" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="truncate font-semibold text-ink-900">{media.originalName}</p>
          <p className="text-xs text-ink-500">
            {media.width && media.height ? `${media.width}×${media.height} · ` : ""}
            {formatBytes(media.size)} · {formatDate(media.createdAt)} · used in {usedIn} place{usedIn === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={media.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
            Open original
          </a>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.origin + media.url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch {
                /* ignore */
              }
            }}
            className="btn btn-secondary btn-sm"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />} Copy URL
          </button>
          {media.mimeType.startsWith("image/") && (
            <>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={replacing} className="btn btn-secondary btn-sm">
                {replacing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Replace
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && replace(e.target.files[0])} />
            </>
          )}
        </div>
        {replaceError && <p className="text-xs text-red-600">{replaceError}</p>}

        <form action={action} className="space-y-3">
          <FormAlert state={state} />
          <Field label="Alt text" name="alt" error={state.errors?.alt} hint="Describes the image for accessibility and SEO.">
            <input id="alt" name="alt" className="input" defaultValue={media.alt} maxLength={300} />
          </Field>
          <Field label="Caption" name="caption" error={state.errors?.caption}>
            <input id="caption" name="caption" className="input" defaultValue={media.caption} maxLength={500} />
          </Field>
          <Field label="Folder" name="folder" error={state.errors?.folder}>
            <input id="folder" name="folder" className="input" defaultValue={media.folder} maxLength={60} />
          </Field>
          <SubmitButton className="btn-sm w-full" pendingText="Saving…">
            Save details
          </SubmitButton>
        </form>

        <div className="border-t border-ink-200 pt-4">
          {usedIn > 0 && <p className="mb-2 text-xs text-amber-700">This image is used in {usedIn} place{usedIn === 1 ? "" : "s"}. Deleting it removes it from those galleries.</p>}
          <ConfirmButton action={deleteMediaAction} hiddenFields={{ id: media.id }} label="Delete image" confirmLabel="Yes, delete file" />
        </div>
      </div>
    </div>
  );
}
