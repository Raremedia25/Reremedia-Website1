import Link from "next/link";
import { Eye, FilePlus2, Pencil } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { deletePostAction, setPostStatusAction } from "@/actions/posts";
import { ConfirmButton } from "@/components/admin/forms";
import { EmptyRow, PageHeader, Pagination, StatusBadge, Table, Td, Th } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { POST_TYPE_LABELS, PUBLISH_STATUSES, type PostType } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { cn, formatDate } from "@/lib/utils";

const PAGE_SIZE = 20;

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string; deleted?: string }> }) {
  await requirePermission("posts:manage");
  const { q = "", status = "", page: p, deleted } = await searchParams;
  const page = Math.max(1, Number(p) || 1);
  const where: Prisma.PostWhereInput = {};
  if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { excerpt: { contains: q, mode: "insensitive" } }];
  if (status && (PUBLISH_STATUSES as readonly string[]).includes(status)) where.publishStatus = status;
  const [items, total] = await Promise.all([
    prisma.post.findMany({ where, include: { category: true, author: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    prisma.post.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Posts & updates"
        description={`${total} post${total === 1 ? "" : "s"}: articles, announcements, case studies, tutorials and news.`}
        actions={
          <Link href="/admin/posts/new" className="btn btn-primary btn-sm">
            <FilePlus2 className="h-4 w-4" /> New post
          </Link>
        }
      />
      {deleted && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Post deleted.</p>}
      <form className="mb-4 flex flex-col gap-2 sm:flex-row" action="/admin/posts">
        <input type="search" name="q" defaultValue={q} placeholder="Search posts…" className="input sm:max-w-xs" />
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
            <Th>Title</Th>
            <Th>Type</Th>
            <Th>Status</Th>
            <Th>Author</Th>
            <Th>Published</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyRow colSpan={6} message="No posts yet. Write your first update or article." />
          ) : (
            items.map((post) => (
              <tr key={post.id} className="hover:bg-ink-50/60">
                <Td>
                  <Link href={`/admin/posts/${post.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                    {post.title}
                  </Link>
                  <p className="truncate text-xs text-ink-500">/blog/{post.slug}</p>
                </Td>
                <Td>
                  {POST_TYPE_LABELS[post.type as PostType] ?? post.type}
                  {post.category && <span className="block text-xs text-ink-500">{post.category.name}</span>}
                </Td>
                <Td>
                  <StatusBadge value={post.publishStatus} />
                </Td>
                <Td className="text-ink-500">{post.author?.name ?? "—"}</Td>
                <Td className="text-ink-500">{post.publishedAt ? formatDate(post.publishedAt) : "—"}</Td>
                <Td>
                  <div className="flex items-center justify-end gap-1.5">
                    <form action={setPostStatusAction}>
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="publishStatus" value={post.publishStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED"} />
                      <button className={cn("btn btn-sm", post.publishStatus === "PUBLISHED" ? "btn-secondary" : "btn-primary")}>{post.publishStatus === "PUBLISHED" ? "Unpublish" : "Publish"}</button>
                    </form>
                    <Link href={`/blog/${post.slug}`} target="_blank" className="btn btn-secondary btn-sm" aria-label="Preview">
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link href={`/admin/posts/${post.id}`} className="btn btn-secondary btn-sm" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <ConfirmButton action={deletePostAction} hiddenFields={{ id: post.id }} label="" />
                  </div>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      <Pagination page={page} pages={pages} hrefFor={(n) => `/admin/posts?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), page: String(n) })}`} />
    </>
  );
}
