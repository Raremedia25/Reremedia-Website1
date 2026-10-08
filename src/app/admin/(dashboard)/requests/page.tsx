import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { EmptyRow, PageHeader, Pagination, StatusBadge, Table, Td, Th } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { REQUEST_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { cn, formatDateTime } from "@/lib/utils";

const PAGE_SIZE = 25;

export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string; deleted?: string }> }) {
  await requirePermission("requests:manage");
  const { status = "", q = "", page: p, deleted } = await searchParams;
  const page = Math.max(1, Number(p) || 1);
  const where: Prisma.ProjectRequestWhereInput = {};
  if (status && (REQUEST_STATUSES as readonly string[]).includes(status)) where.status = status;
  if (q) where.OR = [{ fullName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { projectType: { contains: q, mode: "insensitive" } }];
  const [items, total] = await Promise.all([
    prisma.projectRequest.findMany({ where, orderBy: { createdAt: "desc" }, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    prisma.projectRequest.count({ where }),
  ]);
  return (
    <>
      <PageHeader title="Project requests" description={`${total} request${total === 1 ? "" : "s"} submitted through the website.`} />
      {deleted && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Request deleted.</p>}
      <form className="mb-4 flex flex-col gap-2 sm:flex-row" action="/admin/requests">
        <input type="search" name="q" defaultValue={q} placeholder="Search requests…" className="input sm:max-w-xs" />
        <select name="status" defaultValue={status} className="input sm:max-w-[180px]">
          <option value="">All</option>
          {REQUEST_STATUSES.map((s) => (
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
            <Th>Reference</Th>
            <Th>Client</Th>
            <Th>Project type</Th>
            <Th>Budget</Th>
            <Th>Status</Th>
            <Th>Received</Th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyRow colSpan={6} message="No project requests yet." />
          ) : (
            items.map((r) => (
              <tr key={r.id} className={cn("hover:bg-ink-50/60", r.status === "NEW" && "bg-brand-50/40")}>
                <Td>
                  <Link href={`/admin/requests/${r.id}`} className="font-mono text-xs font-semibold text-brand-700">
                    RR-{r.id.slice(-6).toUpperCase()}
                  </Link>
                </Td>
                <Td>
                  <Link href={`/admin/requests/${r.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                    {r.fullName}
                  </Link>
                  <p className="text-xs text-ink-500">{r.company || r.email}</p>
                </Td>
                <Td>{r.projectType}</Td>
                <Td className="text-ink-500">{r.budgetRange ?? "—"}</Td>
                <Td>
                  <StatusBadge value={r.status} />
                </Td>
                <Td className="text-ink-500">{formatDateTime(r.createdAt)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      <Pagination page={page} pages={Math.max(1, Math.ceil(total / PAGE_SIZE))} hrefFor={(n) => `/admin/requests?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), page: String(n) })}`} />
    </>
  );
}
