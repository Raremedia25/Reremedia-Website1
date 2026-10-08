import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth/current-user";

export async function audit(
  user: CurrentUser | null,
  action: string,
  entity: string,
  entityId?: string | null,
  details?: Record<string, unknown> | string | null,
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: user?.id ?? null,
        userEmail: user?.email ?? null,
        action,
        entity,
        entityId: entityId ?? null,
        details: details == null ? null : typeof details === "string" ? details : JSON.stringify(details).slice(0, 4000),
      },
    });
  } catch (err) {
    console.error("[audit] failed to write audit log", err);
  }
}

export async function notify(type: string, title: string, body?: string, link?: string) {
  try {
    await prisma.notification.create({ data: { type, title, body: body ?? null, link: link ?? null } });
  } catch (err) {
    console.error("[notify] failed to create notification", err);
  }
}
