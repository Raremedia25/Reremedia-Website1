"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { assertPermission } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { parseJson, stringifyList } from "@/lib/json";
import { slugify, uniqueSlug } from "@/lib/slug";
import { actionError, revalidatePublic, type ActionState } from "@/lib/actions-shared";
import { flattenErrors, formDataToObject, projectSchema } from "@/lib/validation";

interface GalleryEntry {
  mediaId: string;
  caption?: string;
}

function parseGallery(raw: string | undefined): GalleryEntry[] {
  return parseJson<GalleryEntry[]>(raw, []).filter((g) => g && typeof g.mediaId === "string").slice(0, 60);
}

async function resolvePublishFields(input: { publishStatus: string; scheduledAt: Date | null }, existingPublishedAt?: Date | null) {
  if (input.publishStatus === "PUBLISHED") return { publishedAt: existingPublishedAt ?? new Date(), scheduledAt: null };
  if (input.publishStatus === "SCHEDULED") {
    if (!input.scheduledAt) throw Object.assign(new Error("Could not schedule: choose a date and time."), { field: "scheduledAt" });
    return { publishedAt: input.scheduledAt, scheduledAt: input.scheduledAt };
  }
  return { publishedAt: null, scheduledAt: null };
}

export async function saveProjectAction(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  let savedId: string;
  try {
    const user = await assertPermission("projects:manage");
    const raw = formDataToObject(formData);
    const parsed = projectSchema.safeParse(raw);
    if (!parsed.success) return { error: "Please check the highlighted fields.", errors: flattenErrors(parsed.error) };
    const data = parsed.data;
    const gallery = parseGallery(raw.gallery);

    const existing = id ? await prisma.project.findUnique({ where: { id } }) : null;
    if (id && !existing) return { error: "Project not found." };

    const slug = await uniqueSlug(data.slug || data.title, async (candidate) => {
      const hit = await prisma.project.findUnique({ where: { slug: candidate }, select: { id: true } });
      return !!hit && hit.id !== id;
    });

    let publish;
    try {
      publish = await resolvePublishFields(data, existing?.publishedAt);
    } catch (err) {
      return { error: (err as Error).message, errors: { scheduledAt: "Required for scheduled publishing." } };
    }

    const base = {
      title: data.title,
      slug,
      summary: data.summary,
      content: data.content,
      categoryId: data.categoryId,
      projectStatus: data.projectStatus,
      publishStatus: data.publishStatus,
      publishedAt: publish.publishedAt,
      scheduledAt: publish.scheduledAt,
      clientType: data.clientType,
      completedAt: data.completedAt,
      demoUrl: data.demoUrl,
      githubUrl: data.githubUrl,
      features: stringifyList(data.features),
      technologies: stringifyList(data.technologies),
      featuredImageId: data.featuredImageId,
      isFeatured: data.isFeatured,
      order: data.order,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    };

    const saved = await prisma.$transaction(async (tx) => {
      const project = existing
        ? await tx.project.update({ where: { id: existing.id }, data: base })
        : await tx.project.create({ data: { ...base, authorId: user.id } });
      await tx.projectImage.deleteMany({ where: { projectId: project.id } });
      if (gallery.length) {
        await tx.projectImage.createMany({
          data: gallery.map((g, i) => ({ projectId: project.id, mediaId: g.mediaId, order: i, caption: g.caption?.trim().slice(0, 300) || null })),
        });
      }
      return project;
    });
    savedId = saved.id;
    await audit(user, existing ? "project.update" : "project.create", "project", saved.id, { title: saved.title, publishStatus: saved.publishStatus });
    revalidatePublic("projects");
    revalidatePath("/admin/projects");
  } catch (err) {
    return actionError(err);
  }
  if (!id) redirect(`/admin/projects/${savedId}?created=1`);
  return { success: "Project saved.", id: savedId };
}

export async function deleteProjectAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const user = await assertPermission("projects:manage");
  if (!id) return;
  const project = await prisma.project.findUnique({ where: { id }, select: { title: true } });
  if (!project) return;
  // Gallery links cascade; media files themselves stay in the library so
  // they can be reused or deleted deliberately from the Images section.
  await prisma.project.delete({ where: { id } });
  await audit(user, "project.delete", "project", id, { title: project.title });
  revalidatePublic("projects");
  revalidatePath("/admin/projects");
  redirect("/admin/projects?deleted=1");
}

export async function setProjectStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("publishStatus") ?? "");
  const user = await assertPermission("projects:manage");
  if (!id || !["DRAFT", "PUBLISHED"].includes(status)) return;
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return;
  await prisma.project.update({
    where: { id },
    data: { publishStatus: status, publishedAt: status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : null, scheduledAt: null },
  });
  await audit(user, status === "PUBLISHED" ? "project.publish" : "project.unpublish", "project", id, { title: existing.title });
  revalidatePublic("projects");
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
}
