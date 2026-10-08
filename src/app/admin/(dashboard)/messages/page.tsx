import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { EmptyRow, PageHeader, Pagination, StatusBadge, Table, Td, Th } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { MESSAGE_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { cn, formatDateTime, truncate } from "@/lib/utils";

const PAGE_SIZE = 25;

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string; deleted?: string }> }) {
  await requirePermission("messages:manage");
  const { status = "", q = "", page: p, deleted } = await searchParams;
  const page = Math.max(1, Number(p) || 1);
  const where: Prisma.ContactMessageWhereInput = {};
  if (status && (MESSAGE_STATUSES as readonly string[]).includes(status)) where.status = status;
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { subject: { contains: q, mode: "insensitive" } }, { message: { contains: q, mode: "insensitive" } }];
  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    prisma.contactMessage.count({ where }),
  ]);
  return (
    <>
      <PageHeader title="Contact messages" description={`${total} message${total === 1 ? "" : "s"} from the contact form.`} />
      {deleted && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Message deleted.</p>}
      <form className="mb-4 flex flex-col gap-2 sm:flex-row" action="/admin/messages">
        <input type="search" name="q" defaultValue={q} placeholder="Search messages…" className="input sm:max-w-xs" />
        <select name="status" defaultValue={status} className="input sm:max-w-[180px]">
          <option value="">All</option>
          {MESSAGE_STATUSES.map((s) => (
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
            <Th>From</Th>
            <Th>Subject</Th>
            <Th>Status</Th>
            <Th>Received</Th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyRow colSpan={4} message="No messages yet." />
          ) : (
            items.map((m) => (
              <tr key={m.id} className={cn("hover:bg-ink-50/60", m.status === "NEW" && "bg-brand-50/40")}>
                <Td>
                  <Link href={`/admin/messages/${m.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                    {m.name}
                  </Link>
                  <p className="text-xs text-ink-500">{m.email}</p>
                </Td>
                <Td>
                  <Link href={`/admin/messages/${m.id}`} className="text-ink-900">
                    {m.subject}
                  </Link>
                  <p className="text-xs text-ink-500">{truncate(m.message, 90)}</p>
                </Td>
                <Td>
                  <StatusBadge value={m.status} />
                </Td>
                <Td className="text-ink-500">{formatDateTime(m.createdAt)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      <Pagination page={page} pages={Math.max(1, Math.ceil(total / PAGE_SIZE))} hrefFor={(n) => `/admin/messages?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), page: String(n) })}`} />
    </>
  );
}
