import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Public-site queries. Everything here only returns published content.
 * Scheduled items become visible automatically once their scheduledAt
 * time has passed (no cron needed).
 */

export function publishedWhere(now = new Date()): Prisma.ProjectWhereInput & Prisma.PostWhereInput {
  return {
    OR: [{ publishStatus: "PUBLISHED" }, { publishStatus: "SCHEDULED", scheduledAt: { lte: now } }],
  };
}

export const projectInclude = {
  category: true,
  featuredImage: true,
  images: { orderBy: { order: "asc" as const }, include: { media: true } },
} satisfies Prisma.ProjectInclude;

export type PublicProject = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;

export const postInclude = {
  category: true,
  featuredImage: true,
  author: { select: { name: true } },
  images: { orderBy: { order: "asc" as const }, include: { media: true } },
} satisfies Prisma.PostInclude;

export type PublicPost = Prisma.PostGetPayload<{ include: typeof postInclude }>;

export const getPublishedProjects = cache(async (opts: { category?: string; q?: string; limit?: number; featuredFirst?: boolean } = {}) => {
  const where: Prisma.ProjectWhereInput = { ...publishedWhere() };
  if (opts.category && opts.category !== "all") where.category = { slug: opts.category, type: "project" };
  if (opts.q) {
    const q = opts.q.trim();
    where.AND = [{ OR: [{ title: { contains: q, mode: "insensitive" } }, { summary: { contains: q, mode: "insensitive" } }, { technologies: { contains: q, mode: "insensitive" } }, { features: { contains: q, mode: "insensitive" } }] }];
  }
  return prisma.project.findMany({
    where,
    include: projectInclude,
    orderBy: opts.featuredFirst ? [{ isFeatured: "desc" }, { order: "asc" }, { publishedAt: "desc" }] : [{ order: "asc" }, { publishedAt: "desc" }],
    take: opts.limit,
  });
});

export const getProjectBySlug = cache(async (slug: string) => {
  return prisma.project.findFirst({ where: { slug, ...publishedWhere() }, include: projectInclude });
});

export const getRelatedProjects = cache(async (project: { id: string; categoryId: string | null }, limit = 3) => {
  return prisma.project.findMany({
    where: { ...publishedWhere(), id: { not: project.id }, ...(project.categoryId ? { categoryId: project.categoryId } : {}) },
    include: projectInclude,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
});

export const getProjectCategories = cache(async () => {
  return prisma.category.findMany({ where: { type: "project" }, orderBy: [{ order: "asc" }, { name: "asc" }] });
});

export const getPostCategories = cache(async () => {
  return prisma.category.findMany({ where: { type: "post" }, orderBy: [{ order: "asc" }, { name: "asc" }] });
});

export const getPublishedPosts = cache(async (opts: { category?: string; q?: string; limit?: number; skip?: number } = {}) => {
  const where: Prisma.PostWhereInput = { ...publishedWhere() };
  if (opts.category && opts.category !== "all") where.category = { slug: opts.category, type: "post" };
  if (opts.q) {
    const q = opts.q.trim();
    where.AND = [{ OR: [{ title: { contains: q, mode: "insensitive" } }, { excerpt: { contains: q, mode: "insensitive" } }, { tags: { contains: q, mode: "insensitive" } }] }];
  }
  const [items, total] = await Promise.all([
    prisma.post.findMany({ where, include: postInclude, orderBy: { publishedAt: "desc" }, take: opts.limit, skip: opts.skip }),
    prisma.post.count({ where }),
  ]);
  return { items, total };
});

export const getPostBySlug = cache(async (slug: string) => {
  return prisma.post.findFirst({ where: { slug, ...publishedWhere() }, include: postInclude });
});

export const getPublishedServices = cache(async () => {
  return prisma.service.findMany({ where: { isPublished: true }, orderBy: [{ order: "asc" }, { name: "asc" }] });
});

export const getServiceBySlug = cache(async (slug: string) => {
  return prisma.service.findFirst({ where: { slug, isPublished: true } });
});

/** Images from published projects, for the public gallery. */
export const getGalleryImages = cache(async (opts: { category?: string; q?: string } = {}) => {
  const projects = await getPublishedProjects({ category: opts.category, q: opts.q, featuredFirst: true });
  const seen = new Set<string>();
  const items: Array<{ project: PublicProject; media: PublicProject["images"][number]["media"]; caption: string | null }> = [];
  for (const project of projects) {
    const entries = project.images.length
      ? project.images.map((pi) => ({ media: pi.media, caption: pi.caption }))
      : project.featuredImage
        ? [{ media: project.featuredImage, caption: null }]
        : [];
    for (const e of entries) {
      if (seen.has(e.media.id)) continue;
      seen.add(e.media.id);
      items.push({ project, media: e.media, caption: e.caption });
    }
  }
  return items;
});

export const getPublishedTestimonials = cache(async (limit = 6) => {
  return prisma.testimonial.findMany({
    where: { isPublished: true },
    include: { photo: true, project: { select: { title: true, slug: true } } },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
});

/** Illustrations for the "Working with us" section (media folder: journey). */
export const getJourneyImages = cache(async () => {
  return prisma.media.findMany({ where: { folder: "journey", mimeType: { startsWith: "image/" } }, orderBy: { createdAt: "asc" }, take: 4 });
});

export async function incrementProjectViews(id: string) {
  try {
    await prisma.project.update({ where: { id }, data: { views: { increment: 1 } } });
  } catch {
    /* non-critical */
  }
}

export async function incrementPostViews(id: string) {
  try {
    await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } });
  } catch {
    /* non-critical */
  }
}

export interface SearchResults {
  projects: PublicProject[];
  posts: PublicPost[];
  services: Awaited<ReturnType<typeof getPublishedServices>>;
  categories: Awaited<ReturnType<typeof getProjectCategories>>;
}

export const globalSearch = cache(async (q: string): Promise<SearchResults> => {
  const term = q.trim();
  if (term.length < 2) return { projects: [], posts: [], services: [], categories: [] };
  const [projects, postsRes, services, categories] = await Promise.all([
    getPublishedProjects({ q: term, limit: 12, featuredFirst: true }),
    getPublishedPosts({ q: term, limit: 12 }),
    prisma.service.findMany({
      where: { isPublished: true, OR: [{ name: { contains: term, mode: "insensitive" } }, { summary: { contains: term, mode: "insensitive" } }, { items: { contains: term, mode: "insensitive" } }] },
      orderBy: { order: "asc" },
    }),
    prisma.category.findMany({ where: { OR: [{ name: { contains: term, mode: "insensitive" } }, { description: { contains: term, mode: "insensitive" } }] }, orderBy: { name: "asc" } }),
  ]);
  return { projects, posts: postsRes.items, services, categories };
});
