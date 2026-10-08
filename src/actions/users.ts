"use server";

import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { assertPermission } from "@/lib/auth/current-user";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";
import { actionError, type ActionState } from "@/lib/actions-shared";
import { flattenErrors, formDataToObject, userSchema } from "@/lib/validation";

export async function saveUserAction(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const actor = await assertPermission("users:manage");
    const parsed = userSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { error: "Please check the highlighted fields.", errors: flattenErrors(parsed.error) };
    const data = parsed.data;

    const emailTaken = await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } });
    if (emailTaken && emailTaken.id !== id) return { errors: { email: "Another user already uses this email." } };

    if (!id) {
      if (!data.password) return { errors: { password: "A password is required for a new user." } };
      const created = await prisma.user.create({
        data: { name: data.name, email: data.email, role: data.role, isActive: data.isActive, passwordHash: await hashPassword(data.password) },
      });
      await audit(actor, "user.create", "user", created.id, { email: created.email, role: created.role });
      revalidatePath("/admin/users");
      return { success: "User created.", id: created.id };
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return { error: "User not found." };

    // Safety: never let the last active Super Admin demote or deactivate themselves.
    if (existing.role === "SUPER_ADMIN" && (data.role !== "SUPER_ADMIN" || !data.isActive)) {
      const admins = await prisma.user.count({ where: { role: "SUPER_ADMIN", isActive: true } });
      if (admins <= 1) return { error: "You cannot demote or deactivate the last active Super Admin." };
    }
    if (existing.id === actor.id && (data.role !== "SUPER_ADMIN" || !data.isActive)) {
      return { error: "You cannot change your own role or deactivate yourself." };
    }

    await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        ...(data.password ? { passwordHash: await hashPassword(data.password) } : {}),
      },
    });
    await audit(actor, "user.update", "user", id, { email: data.email, role: data.role, isActive: data.isActive, passwordReset: !!data.password });
    revalidatePath("/admin/users");
    return { success: "User updated." };
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteUserAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const actor = await assertPermission("users:manage");
  if (!id || id === actor.id) return;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;
  if (user.role === "SUPER_ADMIN") {
    const admins = await prisma.user.count({ where: { role: "SUPER_ADMIN", isActive: true } });
    if (admins <= 1) return;
  }
  await prisma.user.delete({ where: { id } });
  await audit(actor, "user.delete", "user", id, { email: user.email });
  revalidatePath("/admin/users");
}
