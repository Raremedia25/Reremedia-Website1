import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { DemoRunner } from "@/components/demos/DemoRunner";
import { DEMOS, getDemo } from "@/components/demos/registry";

type Params = Promise<{ key: string }>;
type Search = Promise<{ screen?: string; auth?: string; from?: string; verify?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { key } = await params;
  const demo = getDemo(key);
  if (!demo) return { title: "Demo not found" };
  return {
    title: `${demo.title} interactive demo`,
    description: `${demo.description} Try it in your browser with sample data.`,
    alternates: { canonical: `/demos/${demo.key}` },
  };
}

export default async function DemoPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { key } = await params;
  const demo = getDemo(key);
  if (!demo) notFound();
  const { screen, auth, from, verify } = await searchParams;
  // Only ever link back to a project slug, never to an arbitrary URL.
  const projectSlug = typeof from === "string" && /^[a-z0-9-]{1,120}$/.test(from) ? from : null;
  const others = DEMOS.filter((d) => d.key !== demo.key);

  return (
    <div className="container-x py-8 md:py-10">
      <Link href={projectSlug ? `/projects/${projectSlug}` : "/demos"} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> {projectSlug ? "Back to project details" : "All demos"}
      </Link>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <span className="eyebrow">Interactive demo</span>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink-900 md:text-4xl">{demo.title}</h1>
          <p className="mt-2 leading-relaxed text-ink-500">{demo.description}</p>
        </div>
        <Link href={`/request-project?similar=${encodeURIComponent(demo.title)}`} className="btn btn-primary self-start lg:self-auto">
          Request a system like this <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6">
        <DemoRunner demoKey={demo.key} initialScreen={typeof screen === "string" ? screen : undefined} skipLogin={auth === "1"} verify={typeof verify === "string" ? verify.slice(0, 600) : undefined} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold text-ink-900">What you can try</h2>
          <ul className="mt-4 space-y-2.5">
            {demo.tryIt.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink-700">
                <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-600" /> {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-amber-900">
            <ShieldAlert className="h-5 w-5" /> About this demonstration
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-amber-900">
            <li>Everything here is simulated: names, amounts, receipts and records are sample data.</li>
            <li>The demo runs only in your browser. It is not connected to a customer, a production database or a payment provider.</li>
            <li>Nothing you type is saved or sent anywhere, and reloading the page restores the original data.</li>
            <li>A real installation is configured for your business: your products, prices, users, reports and printers.</li>
          </ul>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-ink-900">More demos</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {others.map((d) => (
            <li key={d.key}>
              <Link href={`/demos/${d.key}`} className="chip border border-ink-200 bg-white px-3.5 py-2 text-sm hover:border-brand-300 hover:bg-brand-50">
                {d.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
