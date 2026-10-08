import type { Metadata } from "next";
import { CtaBanner } from "@/components/site/CtaBanner";
import { EmptyState } from "@/components/site/EmptyState";
import { FilterBar } from "@/components/site/FilterBar";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { PageHero } from "@/components/site/PageHero";
import { toImageSource } from "@/lib/media/image-src";
import { getGalleryImages, getProjectCategories } from "@/lib/queries/public";

export const metadata: Metadata = {
  title: "Portfolio Gallery",
  description: "A visual gallery of Raremedia projects: dashboards, websites, POS screens, booking platforms and AI applications.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const { category, q } = await searchParams;
  const [images, categories] = await Promise.all([getGalleryImages({ category, q }), getProjectCategories()]);
  const items = images
    .map((g) => ({ image: toImageSource(g.media)!, caption: g.caption ?? g.media.caption, title: g.project.title, href: `/projects/${g.project.slug}` }))
    .filter((i) => i.image);

  return (
    <>
      <PageHero eyebrow="Portfolio" title="Image gallery" description="Screens, dashboards and interfaces from systems we have built. Open any image to view it full-screen and jump to the project." />
      <section className="section">
        <div className="container-x">
          <FilterBar basePath="/portfolio" categories={categories} active={category} q={q} placeholder="Search the gallery…" />
          <p className="mt-6 text-sm text-ink-500" aria-live="polite">
            {items.length} {items.length === 1 ? "image" : "images"}
          </p>
          {items.length === 0 ? (
            <div className="mt-8">
              <EmptyState title="No images yet" description="Images appear here as soon as projects with galleries are published." actionLabel="View projects" actionHref="/projects" />
            </div>
          ) : (
            <GalleryGrid items={items} columns={3} showTitles className="mt-6" />
          )}
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
