import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { RequestProjectForm } from "@/components/site/RequestProjectForm";
import { SITE } from "@/lib/site";
import { PROJECT_TYPES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Request a Project",
  description: "Tell Raremedia about your website, system, app or AI project and receive a clear plan and quote.",
  alternates: { canonical: "/request-project" },
};

const TYPE_ALIASES: Record<string, string> = {
  "Website Development": "Website",
  "Business Management Systems": "Management System",
  "Sales & Inventory": "POS",
  "Booking & Reservation": "Booking Platform",
  "AI & Automation": "AI Application",
  "Social & Community Platforms": "Social Platform",
  "Agriculture Technology": "Custom Software",
};

export default async function RequestProjectPage({ searchParams }: { searchParams: Promise<{ type?: string; similar?: string; sector?: string }> }) {
  const { type, similar, sector } = await searchParams;
  const resolvedType = type ? (TYPE_ALIASES[type] ?? ((PROJECT_TYPES as readonly string[]).includes(type) ? type : undefined)) : undefined;
  const defaultDescription = similar
    ? `I would like a system similar to "${similar}" adapted for my business.\n\n`
    : sector
      ? `I am looking for a solution for: ${sector}.\n\n`
      : undefined;

  return (
    <>
      <PageHero eyebrow="Request a Project" title="Get Your System Built" description="Describe what you need. We review every request personally and reply with questions, a plan and a quote.">
        <ul className="grid gap-2 sm:grid-cols-3 text-sm text-ink-200">
          {["Reply within one business day", "Clear scope and pricing", "No obligation"].map((t) => (
            <li key={t} className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {t}
            </li>
          ))}
        </ul>
      </PageHero>
      <section className="section">
        <div className="container-x grid gap-8 lg:grid-cols-[1fr_300px]">
          <RequestProjectForm defaultType={resolvedType} defaultDescription={defaultDescription} />
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <h2 className="font-display font-bold text-ink-900">What happens next?</h2>
              <ol className="mt-4 space-y-3 text-sm text-ink-700">
                {["We read your request and may ask a few questions.", "You receive a proposal with scope, timeline and price.", "We build iteratively and show you progress.", "Launch, training and ongoing support."].map((t, i) => (
                  <li key={t} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full gradient-brand text-xs font-bold text-white">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
            </div>
            <div className="card p-6 text-sm">
              <p className="font-semibold text-ink-900">Prefer to talk?</p>
              <p className="mt-1 text-ink-500">
                Email <a href={`mailto:${SITE.email}`} className="text-brand-700 underline underline-offset-2">{SITE.email}</a> or call{" "}
                <a href={SITE.phoneHref} className="text-brand-700 underline underline-offset-2">
                  {SITE.phone}
                </a>
                .
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
