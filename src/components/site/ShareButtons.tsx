"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { SocialIcon } from "./SocialIcon";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url, title });
      } catch {
        /* cancelled */
      }
    } else {
      await copy();
    }
  };

  const links = [
    { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${text}%20${encoded}` },
    { id: "x", label: "X", href: `https://twitter.com/intent/tweet?url=${encoded}&text=${text}` },
    { id: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}` },
    { id: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}` },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-ink-700 mr-1">Share:</span>
      {links.map((l) => (
        <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${l.label}`} className="grid h-9 w-9 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700">
          <SocialIcon id={l.id} className="h-4 w-4" />
        </a>
      ))}
      <button type="button" onClick={copy} aria-label="Copy link" className="grid h-9 w-9 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700">
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
      </button>
      <button type="button" onClick={nativeShare} aria-label="Share" className="grid h-9 w-9 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700 sm:hidden">
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
}
