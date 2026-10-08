import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { CtaBanner } from "@/components/site/CtaBanner";
import { PageHero } from "@/components/site/PageHero";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal } from "@/components/site/Reveal";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { SOLUTIONS } from "@/lib/content/solutions";
import { getPublishedProjects } from "@/lib/queries/public";

export const metadata: Metadata = {
  title: "Solutions for Every Business",
  description: "Industry solutions by Raremedia: businesses, hotels and hospitality, cooperatives, schools, agriculture, organizations and startups.",
  alternates: { canonical: "/solutions" },
};

export default async function SolutionsPage() {
  const projects = await getPublishedProjects({ limit: 3, featuredFirst: true });
  return (
    <>
      <PageHero eyebrow="Solutions" title="Solutions for Every Business" description="Whatever your sector, we have designed systems that match how you work: from the shop counter to the cooperative meeting, from the hotel front desk to the farm." />

      <section className="section">
        <div className="container-x space-y-6">
          {SOLUTIONS.map((s, i) => (
            <Reveal key={s.id} as="article" delay={40}>
              <div id={s.id} className="card scroll-mt-28 p-6 md:p-8 grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-white shadow-glow">
                  <ServiceIcon name={s.icon} className="h-7 w-7" />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink-900">{s.title}</h2>
                  <p className="mt-1 text-ink-500">{s.summary}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {s.items.map((item) => (
                      <li key={item} className="chip bg-brand-50 text-brand-700">
                        <Check className="h-3.5 w-3.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={`/request-project?type=${encodeURIComponent(s.requestType)}&sector=${encodeURIComponent(s.title)}`} className="btn btn-secondary btn-sm md:self-center">
                  Request this solution <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="sr-only">{i}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {projects.length > 0 && (
        <section className="pb-20">
          <div className="container-x">
            <h2 className="font-display text-2xl font-bold text-ink-900 text-center">See these solutions in action</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} className="h-full" />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBanner title="Get a Custom System" description="Your business is unique. We build systems that fit it exactly." primaryLabel="Request a Project" />
    </>
  );
}
