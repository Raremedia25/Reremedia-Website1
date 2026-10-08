import type { Prisma } from "@prisma/client";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";
import { PageHeader, Pagination } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/media/dto";

const PAGE_SIZE = 48;

export default async function AdminMediaPage({ searchParams }: { searchParams: Promise<{ q?: string; folder?: string; page?: string; deleted?: string }> }) {
  await requirePermission("media:manage");
  const { q = "", folder = "", page: p, deleted } = await searchParams;
  const page = Math.max(1, Number(p) || 1);
  const where: Prisma.MediaWhereInput = {};
  if (folder) where.folder = folder;
  if (q) where.OR = [{ originalName: { contains: q, mode: "insensitive" } }, { alt: { contains: q, mode: "insensitive" } }, { caption: { contains: q, mode: "insensitive" } }];

  const [items, total, folders, usage] = await Promise.all([
    prisma.media.findMany({ where, orderBy: { createdAt: "desc" }, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    prisma.media.count({ where }),
    prisma.media.groupBy({ by: ["folder"], _count: { _all: true }, orderBy: { folder: "asc" } }),
    prisma.media.findMany({
      where,
      select: { id: true, _count: { select: { projectImages: true, postImages: true, featuredProjects: true, featuredPosts: true, requestAttachments: true } } },
    }),
  ]);
  const usageMap = Object.fromEntries(usage.map((u) => [u.id, u._count.projectImages + u._count.postImages + u._count.featuredProjects + u._count.featuredPosts + u._count.requestAttachments]));
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader title="Images" description={`${total} file${total === 1 ? "" : "s"} in the media library. Upload once, reuse anywhere.`} />
      {deleted && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Deleted {deleted === "1" ? "1 image" : `${deleted} images`} and their files.</p>}
      <MediaLibrary items={items.map(toMediaDTO)} usage={usageMap} folders={folders.map((f) => ({ name: f.folder, count: f._count._all }))} activeFolder={folder} q={q} />
      <Pagination page={page} pages={pages} hrefFor={(n) => `/admin/media?${new URLSearchParams({ ...(q ? { q } : {}), ...(folder ? { folder } : {}), page: String(n) })}`} />
    </>
  );
}
