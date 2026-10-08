"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { assertPermission } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { deleteMediaCompletely } from "@/lib/media/process";
import { actionError, revalidatePublic, type ActionState } from "@/lib/actions-shared";
import { flattenErrors, formDataToObject, mediaUpdateSchema } from "@/lib/validation";

export async function updateMediaAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await assertPermission("media:manage");
    const parsed = mediaUpdateSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { error: "Please check the form.", errors: flattenErrors(parsed.error) };
    await prisma.media.update({ where: { id }, data: { alt: parsed.data.alt, caption: parsed.data.caption, folder: parsed.data.folder.toLowerCase().replace(/[^a-z0-9-_]/g, "") || "general" } });
    await audit(user, "media.update", "media", id, parsed.data);
    revalidatePath("/admin/media");
    revalidatePublic("all");
    return { success: "Image details saved." };
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteMediaAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const user = await assertPermission("media:manage");
  if (!id) return;
  const media = await prisma.media.findUnique({ where: { id }, select: { originalName: true } });
  await deleteMediaCompletely(id);
  await audit(user, "media.delete", "media", id, { name: media?.originalName });
  revalidatePath("/admin/media");
  revalidatePublic("all");
  redirect("/admin/media?deleted=1");
}

export async function bulkDeleteMediaAction(formData: FormData) {
  const user = await assertPermission("media:manage");
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  for (const id of ids) await deleteMediaCompletely(id);
  if (ids.length) await audit(user, "media.bulkDelete", "media", null, { count: ids.length });
  revalidatePath("/admin/media");
  revalidatePublic("all");
  redirect("/admin/media?deleted=" + ids.length);
}
