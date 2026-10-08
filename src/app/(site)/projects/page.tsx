import type { Metadata } from "next";
import { CtaBanner } from "@/components/site/CtaBanner";
import { EmptyState } from "@/components/site/EmptyState";
import { FilterBar } from "@/components/site/FilterBar";
import { PageHero } from "@/components/site/PageHero";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal } from "@/components/site/Reveal";
import { getProjectCategories, getPublishedProjects } from "@/lib/queries/public";

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore systems built by Raremedia: cooperative management, POS and inventory, booking platforms, AI applications, document tools and more.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const { category, q } = await searchParams;
  const [projects, categories] = await Promise.all([getPublishedProjects({ category, q, featuredFirst: true }), getProjectCategories()]);
  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <>
      <PageHero eyebrow="Projects" title="What Raremedia has built" description="Browse our portfolio of business systems, platforms and applications. Filter by category or search for a feature you need." />

      <section className="section">
        <div className="container-x">
          <FilterBar basePath="/projects" categories={categories} active={category} q={q} placeholder="Search projects…" />

          <p className="mt-6 text-sm text-ink-500" aria-live="polite">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
            {activeCategory ? ` in ${activeCategory.name}` : ""}
            {q ? ` matching “${q}”` : ""}
          </p>

          {projects.length === 0 ? (
            <div className="mt-8">
              <EmptyState title="No projects found" description="Try a different category or search term." actionLabel="Show all projects" actionHref="/projects" />
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, i) => (
                <Reveal key={project.id} delay={(i % 3) * 60}>
                  <ProjectCard project={project} className="h-full" priority={i < 3} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaBanner title="Want a system like these?" description="Every project starts with a conversation. Tell us what you need and we will propose the right solution." primaryLabel="Request a Similar System" />
    </>
  );
}
