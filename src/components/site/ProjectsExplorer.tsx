"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MousePointerClick, Search, X } from "lucide-react";
import type { ShowcaseProject } from "@/lib/content/project-showcase";
import { cn } from "@/lib/utils";
import { InterfacePreview } from "./InterfacePreview";

const SUGGESTIONS = ["Shop sales and stock", "Savings group and loans", "Restaurant or bar orders", "Online exams", "Certificates", "Booking"];

/** Words too common to help a search ("a system for my shop" -> "shop"). */
const STOP = new Set(["a", "an", "and", "the", "for", "of", "or", "to", "my", "our", "with", "in", "on", "system", "platform", "app", "software", "need", "want", "that", "i", "we"]);

function matches(project: ShowcaseProject, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (project.haystack.includes(q)) return true;
  const words = q.split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w));
  if (words.length === 0) return true;
  // Match on word stems so "loans" finds "loan" and "exams" finds "examination".
  return words.some((w) => project.haystack.includes(w.length > 4 ? w.slice(0, -1) : w));
}

function FilterRow({ label, options, value, onChange }: { label: string; options: Array<{ value: string; label: string; count: number }>; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-start md:gap-4">
      <span className="shrink-0 pt-2 text-xs font-bold uppercase tracking-wider text-ink-500 md:w-24">{label}</span>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none md:mx-0 md:flex-wrap md:px-0" role="group" aria-label={`Filter by ${label.toLowerCase()}`}>
        {options.map((o) => (
          <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)} className={cn("chip whitespace-nowrap px-4 py-2 text-sm transition-colors", value === o.value ? "gradient-brand text-white" : "border border-ink-200 bg-white hover:border-brand-300")}>
            {o.label} <span className={cn("text-xs", value === o.value ? "text-white/80" : "text-ink-500")}>{o.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Search, sector and technology filters over the project showcase grid. */
export function ProjectsExplorer({ projects, initialCategory = "all", initialQuery = "" }: { projects: ShowcaseProject[]; initialCategory?: string; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [tech, setTech] = useState("all");

  const categories = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    for (const p of projects) {
      if (!p.categorySlug || !p.categoryName) continue;
      const entry = map.get(p.categorySlug) ?? { label: p.categoryName, count: 0 };
      entry.count++;
      map.set(p.categorySlug, entry);
    }
    return [{ value: "all", label: "All sectors", count: projects.length }, ...[...map].map(([value, e]) => ({ value, ...e }))];
  }, [projects]);

  const stacks = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of projects) for (const t of p.technologies) map.set(t, (map.get(t) ?? 0) + 1);
    const top = [...map].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10);
    return [{ value: "all", label: "All stacks", count: projects.length }, ...top.map(([value, count]) => ({ value, label: value, count }))];
  }, [projects]);

  const visible = projects.filter((p) => (category === "all" || p.categorySlug === category) && (tech === "all" || p.technologies.includes(tech)) && matches(p, query));
  const filtered = category !== "all" || tech !== "all" || query.trim() !== "";
  const reset = () => {
    setQuery("");
    setCategory("all");
    setTech("all");
  };

  return (
    <div>
      <div className="card p-5 md:p-6">
        <label htmlFor="project-search" className="font-display text-lg font-bold text-ink-900">
          Describe what you need
        </label>
        <p className="mt-1 text-sm text-ink-500">We will show the systems we have already built that are closest to it.</p>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
          <input id="project-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="For example: a system to manage sales and stock in my shop" className="input rounded-full pl-11" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => setQuery(s)} className="chip border border-ink-200 bg-white hover:border-brand-300">
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {categories.length > 2 && <FilterRow label="Sector" options={categories} value={category} onChange={setCategory} />}
        {stacks.length > 2 && <FilterRow label="Tech stack" options={stacks} value={tech} onChange={setTech} />}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-500" aria-live="polite">
          Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
          {filtered ? ` of ${projects.length}` : ""}
        </p>
        {filtered && (
          <button type="button" onClick={reset} className="btn btn-secondary btn-sm">
            <X className="h-4 w-4" /> Clear filters
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="card mx-auto mt-8 max-w-lg p-10 text-center">
          <h3 className="font-display text-lg font-bold text-ink-900">{projects.length === 0 ? "Projects are being added" : "No projects match"}</h3>
          <p className="mt-2 text-sm text-ink-500">{projects.length === 0 ? "Our portfolio will appear here shortly. Meanwhile you can try the interactive demos." : "Try a different sector or description, or tell us what you need and we will build it."}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {projects.length === 0 ? (
              <Link href="/demos" className="btn btn-primary btn-sm">
                Try the interactive demos
              </Link>
            ) : (
              <button type="button" onClick={reset} className="btn btn-secondary btn-sm">
                Show all projects
              </button>
            )}
            <Link href="/request-project" className="btn btn-primary btn-sm">
              Start a project
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((p, i) => (
            <li key={p.id}>
              <article className="group flex h-full flex-col">
                <Link href={`/projects/${p.slug}`} aria-label={`${p.title}: view project`} className="block overflow-hidden rounded-3xl border border-ink-200 shadow-sm transition-shadow group-hover:shadow-xl">
                  <InterfacePreview desktop={p.desktop} mobile={p.mobile} cover={p.cover} accent={p.accent} priority={i < 3} />
                </Link>
                <div className="flex flex-1 flex-col px-1 pt-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {p.categoryName && <span className="font-semibold uppercase tracking-wider text-brand-700">{p.categoryName}</span>}
                    <span className={cn("chip", p.completed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{p.status}</span>
                  </div>
                  <h3 className="font-display mt-2 text-xl font-bold leading-snug text-ink-900">
                    <Link href={`/projects/${p.slug}`} className="transition-colors hover:text-brand-700">
                      {p.title}
                    </Link>
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-500">{p.summary}</p>
                  {p.technologies.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Technologies">
                      {p.technologies.slice(0, 4).map((t) => (
                        <li key={t} className="chip bg-ink-100 font-medium text-ink-700">
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                    <Link href={`/projects/${p.slug}`} className="btn btn-secondary btn-sm">
                      View project <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    {p.demo && (
                      <Link href={`/demos/${p.demo.key}?from=${p.slug}`} className="btn btn-primary btn-sm" title="Opens a simulated demo with sample data">
                        <MousePointerClick className="h-4 w-4" /> Try the interface
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
