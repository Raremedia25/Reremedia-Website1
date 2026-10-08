import { ServiceForm } from "@/components/admin/ServiceForm";
import { PageHeader } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";

export default async function NewServicePage() {
  await requirePermission("services:manage");
  return (
    <>
      <PageHeader title="New service" backHref="/admin/services" />
      <ServiceForm values={{ name: "", slug: "", icon: "code", summary: "", description: "", items: "", order: 0, isPublished: true }} />
    </>
  );
}
