import { notFound } from "next/navigation";
import { deleteProjectAction } from "@/actions/projects";
import { ConfirmButton } from "@/components/admin/forms";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { parseList } from "@/lib/json";
import { toMediaDTO } from "@/lib/media/dto";
import { toDateInputValue, toDateTimeInputValue } from "@/lib/utils";

export default async function EditProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requirePermission("projects:manage");
  const { id } = await params;
  const { created } = await searchParams;
  const [project, categories] = await Promise.all([
    prisma.project.findUnique({ where: { id }, include: { featuredImage: true, images: { orderBy: { order: "asc" }, include: { media: true } } } }),
    prisma.category.findMany({ where: { type: "project" }, orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!project) notFound();

  return (
    <>
      <PageHeader
        title={project.title}
        description={`Last updated ${project.updatedAt.toLocaleString("en-GB")} · ${project.views} views`}
        backHref="/admin/projects"
        actions={
          <>
            <StatusBadge value={project.publishStatus} />
            <ConfirmButton action={deleteProjectAction} hiddenFields={{ id: project.id }} label="Delete project" />
          </>
        }
      />
      <ProjectForm
        key={project.updatedAt.toISOString()}
        categories={categories}
        created={!!created}
        values={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          summary: project.summary,
          content: project.content,
          categoryId: project.categoryId ?? "",
          projectStatus: project.projectStatus,
          publishStatus: project.publishStatus,
          scheduledAt: toDateTimeInputValue(project.scheduledAt),
          clientType: project.clientType ?? "",
          completedAt: toDateInputValue(project.completedAt),
          demoUrl: project.demoUrl ?? "",
          githubUrl: project.githubUrl ?? "",
          features: parseList(project.features).join("\n"),
          technologies: parseList(project.technologies).join("\n"),
          isFeatured: project.isFeatured,
          order: project.order,
          seoTitle: project.seoTitle ?? "",
          seoDescription: project.seoDescription ?? "",
          featuredImage: project.featuredImage ? toMediaDTO(project.featuredImage) : null,
          gallery: project.images.map((pi) => ({ media: toMediaDTO(pi.media), caption: pi.caption ?? "" })),
        }}
      />
    </>
  );
}
