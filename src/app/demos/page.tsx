import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MousePointerClick } from "lucide-react";
import { DEMOS } from "@/components/demos/registry";

export const metadata: Metadata = {
  title: "Interactive demos",
  description: "Try Raremedia systems in your browser: a POS, a savings-group manager, a restaurant ordering screen, a certificate generator, transport booking, an online exam and audit working papers. Sample data only.",
  alternates: { canonical: "/demos" },
};

export default function DemosPage() {
  return (
    <div className="container-x py-10 md:py-14">
      <span className="eyebrow">Interactive demos</span>
      <h1 className="font-display mt-3 text-3xl font-bold tracking-tight text-ink-900 md:text-4xl">Try our systems before you ask for one</h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-500">Each demo is a working screen you can click through. They run in your browser on sample data: nothing is saved, no payment is taken and no real customer information is shown.</p>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {DEMOS.map((demo) => (
          <li key={demo.key}>
            <Link href={`/demos/${demo.key}`} className="card card-hover group flex h-full flex-col overflow-hidden">
              <div className="relative h-28 overflow-hidden" style={{ background: `linear-gradient(135deg, #0c0a1d 0%, ${demo.accent} 140%)` }}>
                <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
                <span className="absolute bottom-3 left-5 font-display text-xl font-bold text-white">{demo.title}</span>
                <MousePointerClick className="absolute right-4 top-4 h-6 w-6 text-white/70" aria-hidden="true" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-sm leading-relaxed text-ink-700">{demo.tagline}</p>
                <p className="mt-3 text-xs text-ink-500">{demo.screens.map((s) => s.label).join(" · ")}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-700 transition-all group-hover:gap-2">
                  Try interactive demo <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
