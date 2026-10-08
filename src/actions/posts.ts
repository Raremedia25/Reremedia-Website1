"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { assertPermission } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { parseJson, stringifyList } from "@/lib/json";
import { uniqueSlug } from "@/lib/slug";
import { actionError, revalidatePublic, type ActionState } from "@/lib/actions-shared";
import { flattenErrors, formDataToObject, postSchema } from "@/lib/validation";

interface GalleryEntry {
  mediaId: string;
  caption?: string;
}

export async function savePostAction(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  let savedId: string;
  try {
    const user = await assertPermission("posts:manage");
    const raw = formDataToObject(formData);
    const parsed = postSchema.safeParse(raw);
    if (!parsed.success) return { error: "Please check the highlighted fields.", errors: flattenErrors(parsed.error) };
    const data = parsed.data;
    const gallery = parseJson<GalleryEntry[]>(raw.gallery, []).filter((g) => g && typeof g.mediaId === "string").slice(0, 60);

    const existing = id ? await prisma.post.findUnique({ where: { id } }) : null;
    if (id && !existing) return { error: "Post not found." };

    const slug = await uniqueSlug(data.slug || data.title, async (candidate) => {
      const hit = await prisma.post.findUnique({ where: { slug: candidate }, select: { id: true } });
      return !!hit && hit.id !== id;
    });

    let publishedAt: Date | null = null;
    let scheduledAt: Date | null = null;
    if (data.publishStatus === "PUBLISHED") publishedAt = data.publishedAt ?? existing?.publishedAt ?? new Date();
    if (data.publishStatus === "SCHEDULED") {
      if (!data.scheduledAt) return { error: "Choose a date and time to schedule this post.", errors: { scheduledAt: "Required for scheduled publishing." } };
      scheduledAt = data.scheduledAt;
      publishedAt = data.scheduledAt;
    }

    const base = {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      type: data.type,
      categoryId: data.categoryId,
      tags: stringifyList(data.tags),
      featuredImageId: data.featuredImageId,
      publishStatus: data.publishStatus,
      publishedAt,
      scheduledAt,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    };

    const saved = await prisma.$transaction(async (tx) => {
      const post = existing ? await tx.post.update({ where: { id: existing.id }, data: base }) : await tx.post.create({ data: { ...base, authorId: user.id } });
      await tx.postImage.deleteMany({ where: { postId: post.id } });
      if (gallery.length) {
        await tx.postImage.createMany({ data: gallery.map((g, i) => ({ postId: post.id, mediaId: g.mediaId, order: i, caption: g.caption?.trim().slice(0, 300) || null })) });
      }
      return post;
    });
    savedId = saved.id;
    await audit(user, existing ? "post.update" : "post.create", "post", saved.id, { title: saved.title, publishStatus: saved.publishStatus });
    revalidatePublic("posts");
    revalidatePath("/admin/posts");
  } catch (err) {
    return actionError(err);
  }
  if (!id) redirect(`/admin/posts/${savedId}?created=1`);
  return { success: "Post saved.", id: savedId };
}

export async function deletePostAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const user = await assertPermission("posts:manage");
  if (!id) return;
  const post = await prisma.post.findUnique({ where: { id }, select: { title: true } });
  if (!post) return;
  await prisma.post.delete({ where: { id } });
  await audit(user, "post.delete", "post", id, { title: post.title });
  revalidatePublic("posts");
  revalidatePath("/admin/posts");
  redirect("/admin/posts?deleted=1");
}

export async function setPostStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("publishStatus") ?? "");
  const user = await assertPermission("posts:manage");
  if (!id || !["DRAFT", "PUBLISHED"].includes(status)) return;
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return;
  await prisma.post.update({ where: { id }, data: { publishStatus: status, publishedAt: status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : null, scheduledAt: null } });
  await audit(user, status === "PUBLISHED" ? "post.publish" : "post.unpublish", "post", id, { title: existing.title });
  revalidatePublic("posts");
  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${id}`);
}
