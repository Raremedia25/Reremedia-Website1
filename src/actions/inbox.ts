"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { assertPermission } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { messageStatusSchema, requestStatusSchema } from "@/lib/validation";

export async function setMessageStatusAction(formData: FormData) {
  const user = await assertPermission("messages:manage");
  const id = String(formData.get("id") ?? "");
  const status = messageStatusSchema.safeParse(formData.get("status"));
  if (!id || !status.success) return;
  await prisma.contactMessage.update({ where: { id }, data: { status: status.data } });
  await audit(user, "message.status", "contact_message", id, { status: status.data });
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
}

export async function deleteMessageAction(formData: FormData) {
  const user = await assertPermission("messages:manage");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.contactMessage.delete({ where: { id } });
  await audit(user, "message.delete", "contact_message", id);
  revalidatePath("/admin/messages");
  redirect("/admin/messages?deleted=1");
}

export async function updateRequestAction(formData: FormData) {
  const user = await assertPermission("requests:manage");
  const id = String(formData.get("id") ?? "");
  const status = requestStatusSchema.safeParse(formData.get("status"));
  const notes = String(formData.get("adminNotes") ?? "").slice(0, 5000);
  if (!id || !status.success) return;
  await prisma.projectRequest.update({ where: { id }, data: { status: status.data, adminNotes: notes || null } });
  await audit(user, "request.update", "project_request", id, { status: status.data });
  revalidatePath("/admin/requests");
  revalidatePath(`/admin/requests/${id}`);
}

export async function deleteRequestAction(formData: FormData) {
  const user = await assertPermission("requests:manage");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.projectRequest.delete({ where: { id } });
  await audit(user, "request.delete", "project_request", id);
  revalidatePath("/admin/requests");
  redirect("/admin/requests?deleted=1");
}

export async function markNotificationsReadAction() {
  await assertPermission("dashboard:view");
  await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
  revalidatePath("/admin", "layout");
}
