"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { assertPermission } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { stringifyList } from "@/lib/json";
import { uniqueSlug } from "@/lib/slug";
import { actionError, revalidatePublic, type ActionState } from "@/lib/actions-shared";
import { categorySchema, flattenErrors, formDataToObject, serviceSchema } from "@/lib/validation";

/* ----------------------------------------------------------- services */

export async function saveServiceAction(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await assertPermission("services:manage");
    const parsed = serviceSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { error: "Please check the highlighted fields.", errors: flattenErrors(parsed.error) };
    const data = parsed.data;
    const slug = await uniqueSlug(data.slug || data.name, async (c) => {
      const hit = await prisma.service.findUnique({ where: { slug: c }, select: { id: true } });
      return !!hit && hit.id !== id;
    });
    const payload = { name: data.name, slug, icon: data.icon, summary: data.summary, description: data.description, items: stringifyList(data.items), order: data.order, isPublished: data.isPublished };
    const saved = id ? await prisma.service.update({ where: { id }, data: payload }) : await prisma.service.create({ data: payload });
    await audit(user, id ? "service.update" : "service.create", "service", saved.id, { name: saved.name });
    revalidatePublic("services");
    revalidatePath("/admin/services");
    if (!id) redirect(`/admin/services/${saved.id}?created=1`);
    return { success: "Service saved.", id: saved.id };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err; // redirect
    return actionError(err);
  }
}

export async function deleteServiceAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const user = await assertPermission("services:manage");
  if (!id) return;
  const s = await prisma.service.findUnique({ where: { id }, select: { name: true } });
  if (!s) return;
  await prisma.service.delete({ where: { id } });
  await audit(user, "service.delete", "service", id, { name: s.name });
  revalidatePublic("services");
  revalidatePath("/admin/services");
  redirect("/admin/services?deleted=1");
}

/* --------------------------------------------------------- categories */

export async function saveCategoryAction(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await assertPermission("categories:manage");
    const parsed = categorySchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { error: "Please check the highlighted fields.", errors: flattenErrors(parsed.error) };
    const data = parsed.data;
    const slug = await uniqueSlug(data.slug || data.name, async (c) => {
      const hit = await prisma.category.findUnique({ where: { slug_type: { slug: c, type: data.type } }, select: { id: true } });
      return !!hit && hit.id !== id;
    });
    const payload = { name: data.name, slug, type: data.type, description: data.description || null, color: data.color || null, order: data.order };
    const saved = id ? await prisma.category.update({ where: { id }, data: payload }) : await prisma.category.create({ data: payload });
    await audit(user, id ? "category.update" : "category.create", "category", saved.id, { name: saved.name, type: saved.type });
    revalidatePublic("all");
    revalidatePath("/admin/categories");
    return { success: id ? "Category updated." : "Category created.", id: saved.id };
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteCategoryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const user = await assertPermission("categories:manage");
  if (!id) return;
  const c = await prisma.category.findUnique({ where: { id }, select: { name: true } });
  if (!c) return;
  // Projects/posts keep existing; their categoryId becomes null (SetNull).
  await prisma.category.delete({ where: { id } });
  await audit(user, "category.delete", "category", id, { name: c.name });
  revalidatePublic("all");
  revalidatePath("/admin/categories");
}
