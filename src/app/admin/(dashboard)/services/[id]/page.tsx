import { notFound } from "next/navigation";
import { deleteServiceAction } from "@/actions/catalog";
import { ConfirmButton } from "@/components/admin/forms";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { PageHeader } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { parseList } from "@/lib/json";

export default async function EditServicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requirePermission("services:manage");
  const { id } = await params;
  const { created } = await searchParams;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();
  return (
    <>
      <PageHeader title={service.name} backHref="/admin/services" actions={<ConfirmButton action={deleteServiceAction} hiddenFields={{ id: service.id }} label="Delete service" />} />
      <ServiceForm
        key={service.updatedAt.toISOString()}
        created={!!created}
        values={{ id: service.id, name: service.name, slug: service.slug, icon: service.icon, summary: service.summary, description: service.description ?? "", items: parseList(service.items).join("\n"), order: service.order, isPublished: service.isPublished }}
      />
    </>
  );
}
