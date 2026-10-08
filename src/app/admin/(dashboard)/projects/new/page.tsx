import { ProjectForm } from "@/components/admin/ProjectForm";
import { PageHeader } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

export default async function NewProjectPage() {
  await requirePermission("projects:manage");
  const categories = await prisma.category.findMany({ where: { type: "project" }, orderBy: { order: "asc" }, select: { id: true, name: true } });
  return (
    <>
      <PageHeader title="New project" description="Fill in the details, add images and save as a draft or publish." backHref="/admin/projects" />
      <ProjectForm
        categories={categories}
        values={{
          title: "",
          slug: "",
          summary: "",
          content: "",
          categoryId: "",
          projectStatus: "COMPLETED",
          publishStatus: "DRAFT",
          scheduledAt: "",
          clientType: "",
          completedAt: "",
          demoUrl: "",
          githubUrl: "",
          features: "",
          technologies: "",
          isFeatured: false,
          order: 0,
          seoTitle: "",
          seoDescription: "",
          featuredImage: null,
          gallery: [],
        }}
      />
    </>
  );
}
