import Link from "next/link";
import { ArrowRight, FilePlus2, FolderPlus, ImagePlus } from "lucide-react";
import { Panel, PageHeader, StatCard } from "@/components/admin/ui";
import { requireUser, can } from "@/lib/auth/current-user";
import { getDashboardStats } from "@/lib/queries/admin";
import { timeAgo } from "@/lib/utils";

export default async function AdminOverviewPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const s = await getDashboardStats();

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is what is happening on the Raremedia website."
        actions={
          <>
            {can(user, "projects:manage") && (
              <Link href="/admin/projects/new" className="btn btn-primary btn-sm">
                <FolderPlus className="h-4 w-4" /> New project
              </Link>
            )}
            {can(user, "posts:manage") && (
              <Link href="/admin/posts/new" className="btn btn-secondary btn-sm">
                <FilePlus2 className="h-4 w-4" /> New post
              </Link>
            )}
            {can(user, "media:manage") && (
              <Link href="/admin/media" className="btn btn-secondary btn-sm">
                <ImagePlus className="h-4 w-4" /> Upload images
              </Link>
            )}
          </>
        }
      />

      {denied && (
        <div role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You do not have permission to open that section. Ask a Super Admin if you need access.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total projects" value={s.totalProjects} hint={`${s.publishedProjects} published · ${s.draftProjects} drafts`} href="/admin/projects" accent />
        <StatCard label="Posts" value={s.totalPosts} hint={`${s.publishedPosts} published`} href="/admin/posts" />
        <StatCard label="Images" value={s.totalImages} hint="in the media library" href="/admin/media" />
        <StatCard label="Project requests" value={s.requestTotal} hint={`${s.requestNew} new · ${s.requestsThisMonth} this month`} href="/admin/requests" />
        <StatCard label="Contact messages" value={s.contactTotal} hint={`${s.contactNew} new · ${s.messagesThisMonth} this month`} href="/admin/messages" />
        <StatCard label="Published projects" value={s.publishedProjects} href="/admin/projects?status=PUBLISHED" />
        <StatCard label="Draft projects" value={s.draftProjects} href="/admin/projects?status=DRAFT" />
        <StatCard label="Unread notifications" value={s.notifications.length} href="/admin/notifications" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Recent activity" description="Latest admin actions (full log under Activity)." actions={<Link href="/admin/activity" className="text-sm font-semibold text-brand-700">View all</Link>}>
          {s.recentActivity.length === 0 ? (
            <p className="text-sm text-ink-500">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {s.recentActivity.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900">
                      <span className="chip mr-2 bg-ink-100 text-ink-700">{a.action}</span>
                      <span className="text-ink-500">{a.entity}</span>
                    </p>
                    <p className="truncate text-xs text-ink-500">{a.userEmail ?? "system"} {a.details ? `· ${a.details.slice(0, 80)}` : ""}</p>
                  </div>
                  <span className="shrink-0 text-xs text-ink-500">{timeAgo(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="New notifications" actions={<Link href="/admin/notifications" className="text-sm font-semibold text-brand-700">Open</Link>}>
          {s.notifications.length === 0 ? (
            <p className="text-sm text-ink-500">You are all caught up.</p>
          ) : (
            <ul className="space-y-2">
              {s.notifications.map((n) => (
                <li key={n.id}>
                  <Link href={n.link ?? "/admin/notifications"} className="flex items-start justify-between gap-3 rounded-xl border border-ink-200 p-3 text-sm hover:border-brand-300">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900">{n.title}</p>
                      {n.body && <p className="truncate text-xs text-ink-500">{n.body}</p>}
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-brand-600" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel className="mt-6" title="Publishing workflow" description="Create → upload images → add information → save draft → preview → publish. Published content appears on the public site immediately.">
        <ol className="grid gap-3 text-sm text-ink-700 sm:grid-cols-3 lg:grid-cols-6">
          {["Create project / post", "Upload images", "Add information", "Save as draft", "Preview", "Publish"].map((step, i) => (
            <li key={step} className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full gradient-brand text-xs font-bold text-white">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </Panel>
    </>
  );
}
