import Link from "next/link";
import { Eye, FolderPlus, Pencil } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { deleteProjectAction, setProjectStatusAction } from "@/actions/projects";
import { ConfirmButton } from "@/components/admin/forms";
import { EmptyRow, PageHeader, Pagination, StatusBadge, Table, Td, Th } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { PUBLISH_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/media/dto";
import { cn, formatDate } from "@/lib/utils";

const PAGE_SIZE = 20;

export default async function AdminProjectsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string; deleted?: string }> }) {
  await requirePermission("projects:manage");
  const { q = "", status = "", page: p, deleted } = await searchParams;
  const page = Math.max(1, Number(p) || 1);
  const where: Prisma.ProjectWhereInput = {};
  if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { summary: { contains: q, mode: "insensitive" } }];
  if (status && (PUBLISH_STATUSES as readonly string[]).includes(status)) where.publishStatus = status;

  const [items, total] = await Promise.all([
    prisma.project.findMany({ where, include: { category: true, featuredImage: true, _count: { select: { images: true } } }, orderBy: [{ updatedAt: "desc" }], take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    prisma.project.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hrefFor = (n: number) => `/admin/projects?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), page: String(n) })}`;

  return (
    <>
      <PageHeader
        title="Projects"
        description={`${total} project${total === 1 ? "" : "s"} in the portfolio.`}
        actions={
          <Link href="/admin/projects/new" className="btn btn-primary btn-sm">
            <FolderPlus className="h-4 w-4" /> New project
          </Link>
        }
      />
      {deleted && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Project deleted.</p>}

      <form className="mb-4 flex flex-col gap-2 sm:flex-row" action="/admin/projects">
        <input type="search" name="q" defaultValue={q} placeholder="Search projects…" className="input sm:max-w-xs" />
        <select name="status" defaultValue={status} className="input sm:max-w-[180px]">
          <option value="">All statuses</option>
          {PUBLISH_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary btn-sm">Filter</button>
      </form>

      <Table>
        <thead>
          <tr>
            <Th>Project</Th>
            <Th>Category</Th>
            <Th>Status</Th>
            <Th>Images</Th>
            <Th>Views</Th>
            <Th>Updated</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyRow colSpan={7} message="No projects yet. Create your first project to show it on the website." />
          ) : (
            items.map((p) => {
              const thumb = p.featuredImage ? toMediaDTO(p.featuredImage).thumbUrl : null;
              return (
                <tr key={p.id} className="hover:bg-ink-50/60">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/projects/${p.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                          {p.title}
                        </Link>
                        <p className="truncate text-xs text-ink-500">/projects/{p.slug}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>{p.category?.name ?? <span className="text-ink-500">—</span>}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <StatusBadge value={p.publishStatus} />
                      <StatusBadge value={p.projectStatus} />
                    </div>
                  </Td>
                  <Td>{p._count.images}</Td>
                  <Td>{p.views}</Td>
                  <Td className="text-ink-500">{formatDate(p.updatedAt)}</Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      <form action={setProjectStatusAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="publishStatus" value={p.publishStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED"} />
                        <button className={cn("btn btn-sm", p.publishStatus === "PUBLISHED" ? "btn-secondary" : "btn-primary")}>{p.publishStatus === "PUBLISHED" ? "Unpublish" : "Publish"}</button>
                      </form>
                      <Link href={`/projects/${p.slug}`} target="_blank" className="btn btn-secondary btn-sm" aria-label="Preview">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link href={`/admin/projects/${p.id}`} className="btn btn-secondary btn-sm" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <ConfirmButton action={deleteProjectAction} hiddenFields={{ id: p.id }} label="" />
                    </div>
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
      <Pagination page={page} pages={pages} hrefFor={hrefFor} />
    </>
  );
}
