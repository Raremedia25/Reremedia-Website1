import { AdminShell } from "@/components/admin/AdminShell";
import { requireUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { permissionsForRole } from "@/lib/permissions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [unreadNotifications, newMessages, newRequests] = await Promise.all([
    prisma.notification.count({ where: { isRead: false } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.projectRequest.count({ where: { status: "NEW" } }),
  ]);
  return (
    <AdminShell user={user} permissions={[...permissionsForRole(user.role)]} badges={{ notifications: unreadNotifications, messages: newMessages, requests: newRequests }}>
      {children}
    </AdminShell>
  );
}
