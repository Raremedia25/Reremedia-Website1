"use client";

import { useRef, useState, useTransition } from "react";
import { Bold, Code, Eye, Heading2, Image as ImageIcon, Italic, Link2, List, ListOrdered, PenLine, Quote } from "lucide-react";
import { previewMarkdownAction } from "@/actions/preview";
import type { MediaDTO } from "@/lib/media/dto";
import { cn } from "@/lib/utils";
import { MediaPicker } from "./media/MediaPicker";

/**
 * Markdown editor with a formatting toolbar, image insertion from the
 * media library and a server-rendered (sanitised) preview.
 */
export function MarkdownEditor({ name, defaultValue = "", folder = "general", rows = 18, label = "Content" }: { name: string; defaultValue?: string; folder?: string; rows?: number; label?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [html, setHtml] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrap = (before: string, after = before, placeholder = "text") => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const linePrefix = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const next = `${value.slice(0, lineStart)}${prefix}${value.slice(lineStart)}`;
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  };

  const insertImage = (m: MediaDTO) => {
    const el = ref.current;
    const snippet = `\n![${m.alt || "Image"}](${m.url})\n`;
    if (!el) return setValue((v) => v + snippet);
    const pos = el.selectionStart;
    setValue(`${value.slice(0, pos)}${snippet}${value.slice(pos)}`);
  };

  const showPreview = () => {
    setMode("preview");
    start(async () => setHtml(await previewMarkdownAction(value)));
  };

  const tools = [
    { icon: Bold, label: "Bold", run: () => wrap("**") },
    { icon: Italic, label: "Italic", run: () => wrap("_") },
    { icon: Heading2, label: "Heading", run: () => linePrefix("## ") },
    { icon: List, label: "Bullet list", run: () => linePrefix("- ") },
    { icon: ListOrdered, label: "Numbered list", run: () => linePrefix("1. ") },
    { icon: Quote, label: "Quote", run: () => linePrefix("> ") },
    { icon: Code, label: "Code", run: () => wrap("`") },
    { icon: Link2, label: "Link", run: () => wrap("[", "](https://)", "link text") },
    { icon: ImageIcon, label: "Insert image", run: () => setPickerOpen(true) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="label mb-0">
          {label}
        </label>
        <div className="flex items-center gap-1 rounded-full bg-ink-100 p-0.5">
          <button type="button" onClick={() => setMode("write")} className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold", mode === "write" ? "bg-white shadow" : "text-ink-500")}>
            <PenLine className="h-3.5 w-3.5" /> Write
          </button>
          <button type="button" onClick={showPreview} className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold", mode === "preview" ? "bg-white shadow" : "text-ink-500")}>
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
        </div>
      </div>
      <div className="mt-2 overflow-hidden rounded-xl border border-ink-200 bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
        {mode === "write" ? (
          <>
            <div className="flex flex-wrap items-center gap-0.5 border-b border-ink-200 bg-ink-50 px-2 py-1.5">
              {tools.map((t) => (
                <button key={t.label} type="button" onClick={t.run} title={t.label} aria-label={t.label} className="grid h-8 w-8 place-items-center rounded-md text-ink-700 hover:bg-white hover:text-brand-700">
                  <t.icon className="h-4 w-4" />
                </button>
              ))}
              <span className="ml-auto text-[11px] text-ink-500">Markdown supported</span>
            </div>
            <textarea ref={ref} id={name} name={name} value={value} onChange={(e) => setValue(e.target.value)} rows={rows} className="block w-full resize-y border-0 p-4 font-mono text-sm leading-relaxed text-ink-900 focus:outline-none" spellCheck />
          </>
        ) : (
          <>
            <input type="hidden" name={name} value={value} />
            <div className="min-h-[200px] p-5">
              {pending ? <p className="text-sm text-ink-500">Rendering preview…</p> : html ? <div className="prose-rr" dangerouslySetInnerHTML={{ __html: html }} /> : <p className="text-sm text-ink-500">Nothing to preview yet.</p>}
            </div>
          </>
        )}
      </div>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(items) => items[0] && insertImage(items[0])} folder={folder} title="Insert image" />
    </div>
  );
}
