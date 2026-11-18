import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MousePointerClick } from "lucide-react";
import { CtaBanner } from "@/components/site/CtaBanner";
import { PageHero } from "@/components/site/PageHero";
import { ProjectsExplorer } from "@/components/site/ProjectsExplorer";
import { toShowcaseProject } from "@/lib/content/project-showcase";
import { getPublishedProjects } from "@/lib/queries/public";

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore systems built by Raremedia: cooperative management, POS and inventory, booking platforms, AI applications, document tools and more.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const { category, q } = await searchParams;
  const projects = (await getPublishedProjects({ featuredFirst: true })).map(toShowcaseProject);

  const stats = [
    { value: projects.length, label: "Projects in the portfolio" },
    { value: projects.filter((p) => p.desktop).length, label: "With interface screens" },
    { value: projects.filter((p) => p.demo).length, label: "You can try online" },
    { value: new Set(projects.map((p) => p.categorySlug).filter(Boolean)).size, label: "Sectors served" },
  ];

  return (
    <>
      <PageHero eyebrow="Projects" title="Digital solutions developed by Raremedia" description="Business systems, platforms and applications we have designed and built. Open any project to see its interface, or try a working demo with sample data.">
        <div className="flex flex-wrap gap-3">
          <Link href="/request-project" className="btn btn-primary">
            Start a project <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/demos" className="btn btn-secondary">
            <MousePointerClick className="h-4 w-4" /> Try the interactive demos
          </Link>
        </div>
      </PageHero>

      {projects.length > 0 && (
        <section className="border-b border-ink-200 bg-white">
          <dl className="container-x grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="font-display text-3xl font-extrabold text-ink-900 md:text-4xl">{s.value}</dd>
                <dt className="mt-1 text-sm text-ink-500">{s.label}</dt>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="section">
        <div className="container-x">
          <ProjectsExplorer projects={projects} initialCategory={category ?? "all"} initialQuery={q ?? ""} />
        </div>
      </section>

      <CtaBanner title="Want a system like these?" description="Every project starts with a conversation. Tell us what you need and we will propose the right solution." primaryLabel="Request a Similar System" />
    </>
  );
}
