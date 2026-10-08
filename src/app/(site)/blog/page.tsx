import type { Metadata } from "next";
import Link from "next/link";
import { CtaBanner } from "@/components/site/CtaBanner";
import { EmptyState } from "@/components/site/EmptyState";
import { FilterBar } from "@/components/site/FilterBar";
import { PageHero } from "@/components/site/PageHero";
import { PostCard } from "@/components/site/PostCard";
import { Reveal } from "@/components/site/Reveal";
import { getPostCategories, getPublishedPosts } from "@/lib/queries/public";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

export const metadata: Metadata = {
  title: "Blog & Updates",
  description: "News, product launches, case studies, tutorials and articles about software development, AI and business technology from Raremedia.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string; page?: string }> }) {
  const { category, q, page } = await searchParams;
  const current = Math.max(1, Number(page) || 1);
  const [{ items, total }, categories] = await Promise.all([
    getPublishedPosts({ category, q, limit: PAGE_SIZE, skip: (current - 1) * PAGE_SIZE }),
    getPostCategories(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/blog?${s}` : "/blog";
  };

  return (
    <>
      <PageHero eyebrow="Blog & Updates" title="News, launches and ideas from Raremedia" description="Product updates, case studies, tutorials and thoughts on software, AI and digital transformation." />
      <section className="section">
        <div className="container-x">
          <FilterBar basePath="/blog" categories={categories} active={category} q={q} placeholder="Search articles…" />
          {items.length === 0 ? (
            <div className="mt-10">
              <EmptyState title="No articles yet" description="Updates will appear here as soon as they are published." actionLabel="Back to blog" actionHref="/blog" />
            </div>
          ) : (
            <>
              {current === 1 && !q && !category && items[0] && (
                <Reveal className="mt-8">
                  <PostCard post={items[0]} horizontal />
                </Reveal>
              )}
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(current === 1 && !q && !category ? items.slice(1) : items).map((post, i) => (
                  <Reveal key={post.id} delay={(i % 3) * 60}>
                    <PostCard post={post} className="h-full" />
                  </Reveal>
                ))}
              </div>
              {pages > 1 && (
                <nav className="mt-10 flex justify-center gap-2" aria-label="Pagination">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <Link key={p} href={pageHref(p)} className={cn("grid h-10 w-10 place-items-center rounded-full text-sm font-semibold", p === current ? "gradient-brand text-white" : "bg-white border border-ink-200 hover:border-brand-300")} aria-current={p === current ? "page" : undefined}>
                      {p}
                    </Link>
                  ))}
                </nav>
              )}
            </>
          )}
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
