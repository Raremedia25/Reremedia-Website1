import type { MetadataRoute } from "next";
import { getPublishedPosts, getPublishedProjects } from "@/lib/queries/public";
import { siteUrl } from "@/lib/utils";

// Built from the database on request (see src/app/(site)/layout.tsx).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getPublishedProjects(), getPublishedPosts()]);
  const staticPages: MetadataRoute.Sitemap = ["/", "/services", "/solutions", "/projects", "/portfolio", "/about", "/blog", "/contact", "/request-project", "/privacy"].map((p) => ({
    url: siteUrl(p),
    lastModified: new Date(),
    changeFrequency: p === "/" ? "weekly" : "monthly",
    priority: p === "/" ? 1 : 0.7,
  }));
  return [
    ...staticPages,
    ...projects.map((p) => ({ url: siteUrl(`/projects/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...posts.items.map((p) => ({ url: siteUrl(`/blog/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
