"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/current-user";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { sessionCookieOptions, signSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { changePasswordSchema, flattenErrors, loginSchema } from "@/lib/validation";

export interface ActionState {
  error?: string;
  errors?: Record<string, string>;
  success?: string;
  /** Echoed back so the login form can keep the typed email after an error. */
  email?: string;
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ip = clientIp(await headers());
  const limit = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.ok) return { error: "Too many attempts. Please wait a few minutes and try again." };

  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  const typedEmail = String(formData.get("email") ?? "").slice(0, 160);
  if (!parsed.success) return { error: "Enter a valid email and password.", errors: flattenErrors(parsed.error), email: typedEmail };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) {
    await audit(null, "login.failed", "user", null, { email: parsed.data.email, ip });
    return { error: "Incorrect email or password.", email: typedEmail };
  }
  if (!user.isActive) return { error: "This account has been deactivated. Contact a Super Admin.", email: typedEmail };

  const token = await signSession({ sub: user.id, role: user.role, email: user.email, name: user.name });
  const opts = sessionCookieOptions();
  (await cookies()).set(opts.name, token, opts);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await audit({ id: user.id, name: user.name, email: user.email, role: user.role }, "login.success", "user", user.id, { ip });

  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin");
}

export async function logoutAction() {
  const user = await getCurrentUser();
  const opts = sessionCookieOptions();
  (await cookies()).set(opts.name, "", { ...opts, maxAge: 0 });
  if (user) await audit(user, "logout", "user", user.id);
  redirect("/admin/login");
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be signed in." };
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: "Please check the form.", errors: flattenErrors(parsed.error) };
  const row = await prisma.user.findUnique({ where: { id: user.id } });
  if (!row || !(await verifyPassword(parsed.data.currentPassword, row.passwordHash))) {
    return { errors: { currentPassword: "Current password is incorrect." } };
  }
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.newPassword) } });
  await audit(user, "password.changed", "user", user.id);
  return { success: "Password updated." };
}
