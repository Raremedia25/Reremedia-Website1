import Link from "next/link";
import { ArrowRight, CheckCheck } from "lucide-react";
import { markNotificationsReadAction } from "@/actions/inbox";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { cn, timeAgo } from "@/lib/utils";

export default async function NotificationsPage() {
  await requireUser();
  const items = await prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  const unread = items.filter((n) => !n.isRead).length;
  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread` : "All caught up."}
        actions={
          unread > 0 ? (
            <form action={markNotificationsReadAction}>
              <button className="btn btn-secondary btn-sm">
                <CheckCheck className="h-4 w-4" /> Mark all as read
              </button>
            </form>
          ) : null
        }
      />
      {items.length === 0 ? (
        <div className="card p-12 text-center text-sm text-ink-500">No notifications yet. New contact messages and project requests will appear here.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              <Link href={n.link ?? "#"} className={cn("card card-hover flex items-center justify-between gap-4 p-4", !n.isRead && "border-brand-200 bg-brand-50/40")}>
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">
                    {!n.isRead && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent-500" />}
                    {n.title}
                  </p>
                  {n.body && <p className="truncate text-sm text-ink-500">{n.body}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-ink-500">
                  {timeAgo(n.createdAt)} <ArrowRight className="h-4 w-4 text-brand-600" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
