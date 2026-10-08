import Link from "next/link";
import { Search } from "lucide-react";
import type { Category } from "@prisma/client";
import { cn } from "@/lib/utils";

/**
 * Server-rendered category filter + search form. Uses plain links and a GET
 * form so filtering works without JavaScript and every state has a URL.
 */
export function FilterBar({ basePath, categories, active, q, placeholder = "Search…" }: { basePath: string; categories: Category[]; active?: string; q?: string; placeholder?: string }) {
  const href = (slug: string) => {
    const params = new URLSearchParams();
    if (slug !== "all") params.set("category", slug);
    if (q) params.set("q", q);
    const s = params.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const current = active ?? "all";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <nav className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap" aria-label="Filter by category">
        <Link href={href("all")} className={cn("chip px-4 py-2 text-sm whitespace-nowrap transition-colors", current === "all" ? "gradient-brand text-white" : "bg-white border border-ink-200 hover:border-brand-300")}>
          All
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={href(c.slug)} className={cn("chip px-4 py-2 text-sm whitespace-nowrap transition-colors", current === c.slug ? "gradient-brand text-white" : "bg-white border border-ink-200 hover:border-brand-300")}>
            {c.name}
          </Link>
        ))}
      </nav>
      <form action={basePath} method="get" className="relative lg:w-72 shrink-0" role="search">
        {current !== "all" && <input type="hidden" name="category" value={current} />}
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
        <input type="search" name="q" defaultValue={q} placeholder={placeholder} className="input pl-10 rounded-full" aria-label={placeholder} />
      </form>
    </div>
  );
}
