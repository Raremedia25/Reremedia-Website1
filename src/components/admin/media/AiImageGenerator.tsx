"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { MediaDTO } from "@/lib/media/dto";

const IDEAS = [
  "A cashier at a small supermarket counter using a touchscreen POS terminal, stocked shelves behind",
  "Adult learners in a computer training lab working at desktop computers while a trainer points at a screen",
  "Members of a savings cooperative seated in a circle at a community meeting while a treasurer uses a laptop",
  "Two accountants in an office reviewing printed reports and binders beside a laptop showing charts",
];

/**
 * "Generate with AI" tab of the media picker. Sends a description to
 * /api/admin/media/generate; the result is saved in the library marked as
 * AI-generated and handed back through `onGenerated`.
 */
export function AiImageGenerator({ folder, onGenerated }: { folder: string; onGenerated: (item: MediaDTO) => void }) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MediaDTO | null>(null);

  useEffect(() => {
    fetch("/api/admin/media/generate")
      .then((r) => r.json())
      .then((j) => setConfigured(!!j.configured))
      .catch(() => setConfigured(false));
  }, []);

  const generate = async () => {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/admin/media/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, folder }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.item) setError(json.error ?? "Generation failed. Please try again.");
      else setResult(json.item);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (configured === null) {
    return (
      <div className="grid place-items-center py-16 text-ink-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (!configured) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
        <p className="font-bold">AI image generation is not set up yet.</p>
        <p className="mt-1">
          Add an <code className="rounded bg-white px-1">OPENAI_API_KEY</code> to the site&apos;s environment variables (Netlify → Site configuration → Environment variables), then redeploy. Each generated image is billed by the provider to that account.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <label className="label" htmlFor="ai-prompt">
          Describe the image
        </label>
        <textarea id="ai-prompt" className="input min-h-36" value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={1000} placeholder="Who is in the picture, what are they doing, and where?" />
        <p className="mt-1 text-xs text-ink-500">Do not name real people, businesses or places. “No text, no logos, photorealistic” is added for you.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {IDEAS.map((idea) => (
            <button key={idea} type="button" onClick={() => setPrompt(idea)} className="chip border border-ink-200 bg-white text-left hover:border-brand-300" title={idea}>
              {idea.split(" ").slice(0, 5).join(" ")}…
            </button>
          ))}
        </div>
        <button type="button" onClick={generate} disabled={busy || prompt.trim().length < 10} className="btn btn-primary mt-4">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {busy ? "Generating… (up to a minute)" : result ? "Generate another" : "Generate image"}
        </button>
        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <p className="mt-3 text-xs text-ink-500">Each image is billed by the provider. Results are saved to the library and labelled “AI-generated image” on the public site.</p>
      </div>
      <div>
        {result ? (
          <div className="overflow-hidden rounded-2xl border border-ink-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.url} alt={result.alt} className="aspect-[3/2] w-full bg-ink-100 object-cover" />
            <div className="flex items-center justify-between gap-2 p-3">
              <span className="text-xs text-ink-500">Check for garbled text or odd details before using it.</span>
              <button type="button" onClick={() => onGenerated(result)} className="btn btn-primary btn-sm">
                Use this image
              </button>
            </div>
          </div>
        ) : (
          <div className="grid aspect-[3/2] place-items-center rounded-2xl border-2 border-dashed border-ink-300 text-sm text-ink-500">{busy ? "Working on it…" : "Your image will appear here."}</div>
        )}
      </div>
    </div>
  );
}
