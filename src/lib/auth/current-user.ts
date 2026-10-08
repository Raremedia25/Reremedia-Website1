import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, type Permission } from "@/lib/constants";
import { roleHasPermission } from "@/lib/permissions";
import { verifySession } from "./session";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Resolve the signed-in admin user for the current request.
 * The session JWT is verified first; the user row is then loaded so that
 * deactivated accounts or role changes take effect immediately.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requirePermission(permission: Permission): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roleHasPermission(user.role, permission)) redirect("/admin?denied=1");
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message = "Unauthorized", status = 401) {
    super(message);
    this.status = status;
  }
}

/** Variant for server actions / API routes: throws instead of redirecting. */
export async function assertPermission(permission: Permission): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("You must be signed in.", 401);
  if (!roleHasPermission(user.role, permission)) throw new AuthError("You do not have permission to do this.", 403);
  return user;
}

export function can(user: CurrentUser | null, permission: Permission): boolean {
  return !!user && roleHasPermission(user.role, permission);
}
