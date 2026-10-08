import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { deleteServiceAction } from "@/actions/catalog";
import { ConfirmButton } from "@/components/admin/forms";
import { EmptyRow, PageHeader, StatusBadge, Table, Td, Th } from "@/components/admin/ui";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { requirePermission } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { parseList } from "@/lib/json";

export default async function AdminServicesPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  await requirePermission("services:manage");
  const { deleted } = await searchParams;
  const services = await prisma.service.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
  return (
    <>
      <PageHeader
        title="Services"
        description="The service cards shown on the homepage and Services page."
        actions={
          <Link href="/admin/services/new" className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4" /> New service
          </Link>
        }
      />
      {deleted && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Service deleted.</p>}
      <Table>
        <thead>
          <tr>
            <Th>Service</Th>
            <Th>Offerings</Th>
            <Th>Order</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {services.length === 0 ? (
            <EmptyRow colSpan={5} message="No services yet." />
          ) : (
            services.map((s) => (
              <tr key={s.id} className="hover:bg-ink-50/60">
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                      <ServiceIcon name={s.icon} className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <Link href={`/admin/services/${s.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                        {s.name}
                      </Link>
                      <p className="line-clamp-1 text-xs text-ink-500">{s.summary}</p>
                    </div>
                  </div>
                </Td>
                <Td>{parseList(s.items).length}</Td>
                <Td>{s.order}</Td>
                <Td>
                  <StatusBadge value={s.isPublished ? "PUBLISHED" : "DRAFT"} label={s.isPublished ? "Published" : "Hidden"} />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href={`/admin/services/${s.id}`} className="btn btn-secondary btn-sm" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <ConfirmButton action={deleteServiceAction} hiddenFields={{ id: s.id }} label="" />
                  </div>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
