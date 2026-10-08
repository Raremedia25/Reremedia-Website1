import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBanner } from "@/components/site/CtaBanner";
import { JourneyStrip } from "@/components/site/JourneyStrip";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { ServiceCard } from "@/components/site/ServiceCard";
import { TECHNOLOGIES } from "@/lib/site";
import { getPublishedServices } from "@/lib/queries/public";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Website development, business management systems, POS and inventory, booking platforms, AI and automation, social platforms, agriculture technology and custom software by Raremedia.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const services = await getPublishedServices();
  return (
    <>
      <PageHero eyebrow="Services" title="From a professional website to an AI-powered platform" description="Raremedia designs, builds and supports digital products for businesses, cooperatives, institutions, hotels, shops, organizations and individual clients.">
        <JourneyStrip light className="justify-start" />
      </PageHero>

      <section className="section">
        <div className="container-x">
          {services.length === 0 ? (
            <p className="text-center text-ink-500">Services will appear here once they are published from the admin dashboard.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {services.map((service, i) => (
                <Reveal key={service.id} delay={(i % 2) * 80}>
                  <ServiceCard service={service} className="h-full" />
                </Reveal>
              ))}
            </div>
          )}

          <Reveal className="mt-10">
            <div className="rounded-3xl gradient-brand p-8 md:p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold">Need something completely custom?</h2>
                <p className="mt-2 text-white/85 max-w-xl">Describe your idea and requirements. We design a system around them and tell you exactly what it will take.</p>
              </div>
              <Link href="/request-project?type=Custom%20Software" className="btn bg-white text-brand-700 hover:bg-brand-50 shrink-0">
                Request a Quote <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-x">
          <h2 className="font-display text-2xl font-bold text-ink-900 text-center">Technologies we work with</h2>
          <p className="mt-2 text-center text-ink-500 text-sm">We pick the stack that fits each project; the tools below are the ones we use most.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TECHNOLOGIES.map((group) => (
              <div key={group.group} className="card p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-700">{group.group}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((t) => (
                    <li key={t} className="chip">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner title="Get Your System Built" description="Share what your business needs and receive a clear plan, timeline and quote." primaryLabel="Request a Quote" />
    </>
  );
}
