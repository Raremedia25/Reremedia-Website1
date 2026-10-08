import { EmptyRow, PageHeader, Pagination, Table, Td, Th } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

const PAGE_SIZE = 50;

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ page?: string; entity?: string }> }) {
  await requirePermission("analytics:view");
  const { page: p, entity = "" } = await searchParams;
  const page = Math.max(1, Number(p) || 1);
  const where = entity ? { entity } : {};
  const [items, total, entities] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({ by: ["entity"], orderBy: { entity: "asc" } }),
  ]);
  return (
    <>
      <PageHeader title="Activity log" description="Audit trail of important admin actions: logins, content changes, uploads, deletions and settings." />
      <form className="mb-4 flex gap-2" action="/admin/activity">
        <select name="entity" defaultValue={entity} className="input sm:max-w-[220px]">
          <option value="">All entities</option>
          {entities.map((e) => (
            <option key={e.entity} value={e.entity}>
              {e.entity}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary btn-sm">Filter</button>
      </form>
      <Table>
        <thead>
          <tr>
            <Th>When</Th>
            <Th>User</Th>
            <Th>Action</Th>
            <Th>Entity</Th>
            <Th>Details</Th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyRow colSpan={5} message="No activity recorded yet." />
          ) : (
            items.map((a) => (
              <tr key={a.id} className="hover:bg-ink-50/60">
                <Td className="whitespace-nowrap text-ink-500">{formatDateTime(a.createdAt)}</Td>
                <Td className="text-ink-900">{a.userEmail ?? <span className="text-ink-500">system</span>}</Td>
                <Td>
                  <span className="chip bg-ink-100 text-ink-700">{a.action}</span>
                </Td>
                <Td className="text-ink-700">
                  {a.entity}
                  {a.entityId && <span className="block font-mono text-[10px] text-ink-500">{a.entityId}</span>}
                </Td>
                <Td className="max-w-md truncate font-mono text-xs text-ink-500" title={a.details ?? ""}>
                  {a.details ?? ""}
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      <Pagination page={page} pages={Math.max(1, Math.ceil(total / PAGE_SIZE))} hrefFor={(n) => `/admin/activity?${new URLSearchParams({ ...(entity ? { entity } : {}), page: String(n) })}`} />
    </>
  );
}
