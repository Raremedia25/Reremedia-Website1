import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/site/EmptyState";
import { PageHero } from "@/components/site/PageHero";
import { PostCard } from "@/components/site/PostCard";
import { ProjectCard } from "@/components/site/ProjectCard";
import { ServiceCard } from "@/components/site/ServiceCard";
import { globalSearch } from "@/lib/queries/public";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Raremedia projects, services, articles and categories.",
  robots: { index: false },
};

const SCOPES = [
  { id: "all", label: "Everything" },
  { id: "projects", label: "Projects" },
  { id: "services", label: "Services" },
  { id: "posts", label: "Articles" },
  { id: "categories", label: "Categories" },
] as const;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; scope?: string }> }) {
  const { q = "", scope = "all" } = await searchParams;
  const results = q.trim().length >= 2 ? await globalSearch(q) : null;
  const total = results ? results.projects.length + results.posts.length + results.services.length + results.categories.length : 0;
  const show = (s: string) => scope === "all" || scope === s;

  return (
    <>
      <PageHero eyebrow="Search" title="Find projects, services and articles">
        <form action="/search" method="get" role="search" className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" aria-hidden="true" />
          <input type="search" name="q" defaultValue={q} placeholder="e.g. POS, booking, cooperative, AI…" className="input rounded-full pl-12 pr-32 py-3.5 text-base text-ink-900" aria-label="Search" autoFocus />
          <button type="submit" className="btn btn-primary btn-sm absolute right-1.5 top-1/2 -translate-y-1/2">
            Search
          </button>
        </form>
      </PageHero>

      <section className="section">
        <div className="container-x">
          {!results ? (
            <p className="text-center text-ink-500">Type at least two characters to search.</p>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink-500" aria-live="polite">
                  {total} {total === 1 ? "result" : "results"} for “{q}”
                </p>
                <nav className="flex gap-2 overflow-x-auto scrollbar-none" aria-label="Filter results">
                  {SCOPES.map((s) => (
                    <Link key={s.id} href={`/search?q=${encodeURIComponent(q)}&scope=${s.id}`} className={cn("chip px-4 py-2 text-sm whitespace-nowrap", scope === s.id ? "gradient-brand text-white" : "bg-white border border-ink-200")}>
                      {s.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {total === 0 && (
                <div className="mt-10">
                  <EmptyState title="Nothing matched" description="Try a shorter or different keyword, or browse our projects and services." actionLabel="Browse projects" actionHref="/projects" />
                </div>
              )}

              {show("projects") && results.projects.length > 0 && (
                <div className="mt-10">
                  <h2 className="font-display text-xl font-bold text-ink-900">Projects</h2>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {results.projects.map((p) => (
                      <ProjectCard key={p.id} project={p} className="h-full" />
                    ))}
                  </div>
                </div>
              )}
              {show("services") && results.services.length > 0 && (
                <div className="mt-10">
                  <h2 className="font-display text-xl font-bold text-ink-900">Services</h2>
                  <div className="mt-4 grid gap-5 md:grid-cols-2">
                    {results.services.map((s) => (
                      <ServiceCard key={s.id} service={s} compact className="h-full" />
                    ))}
                  </div>
                </div>
              )}
              {show("posts") && results.posts.length > 0 && (
                <div className="mt-10">
                  <h2 className="font-display text-xl font-bold text-ink-900">Articles</h2>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {results.posts.map((p) => (
                      <PostCard key={p.id} post={p} className="h-full" />
                    ))}
                  </div>
                </div>
              )}
              {show("categories") && results.categories.length > 0 && (
                <div className="mt-10">
                  <h2 className="font-display text-xl font-bold text-ink-900">Categories</h2>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {results.categories.map((c) => (
                      <li key={c.id}>
                        <Link href={c.type === "post" ? `/blog?category=${c.slug}` : `/projects?category=${c.slug}`} className="chip bg-white border border-ink-200 px-4 py-2 text-sm hover:border-brand-300">
                          {c.name} <span className="text-ink-500">· {c.type === "post" ? "blog" : "projects"}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
