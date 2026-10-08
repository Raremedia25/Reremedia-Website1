import Link from "next/link";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/constants";
import { getAnalytics } from "@/lib/queries/admin";

export default async function AnalyticsPage() {
  await requirePermission("analytics:view");
  const a = await getAnalytics();
  const maxMonth = Math.max(1, ...a.months.map((m) => Math.max(m.requests, m.messages)));

  return (
    <>
      <PageHeader title="Analytics" description="Engagement derived from your own data: page views on projects and posts, requests and messages. No third-party tracking." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Project page views" value={a.totalProjectViews} hint="top 8 projects" accent />
        <StatCard label="Article views" value={a.totalPostViews} hint="top 8 articles" />
        <StatCard label="Requests (6 months)" value={a.months.reduce((s, m) => s + m.requests, 0)} href="/admin/requests" />
        <StatCard label="Messages (6 months)" value={a.months.reduce((s, m) => s + m.messages, 0)} href="/admin/messages" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Requests & messages per month">
          <div className="flex items-end gap-3 h-48" role="img" aria-label="Monthly requests and messages">
            {a.months.map((m) => (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full items-end justify-center gap-1 h-36">
                  <div className="w-1/3 rounded-t-md gradient-brand" style={{ height: `${(m.requests / maxMonth) * 100}%` }} title={`${m.requests} requests`} />
                  <div className="w-1/3 rounded-t-md bg-cyan-500" style={{ height: `${(m.messages / maxMonth) * 100}%` }} title={`${m.messages} messages`} />
                </div>
                <span className="text-[11px] text-ink-500">{m.label}</span>
                <span className="text-[11px] font-semibold text-ink-700">
                  {m.requests}/{m.messages}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm gradient-brand" /> Project requests
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500" /> Contact messages
            </span>
          </div>
        </Panel>

        <Panel title="Requests by project type">
          {a.requestsByType.length === 0 ? (
            <p className="text-sm text-ink-500">No requests yet.</p>
          ) : (
            <ul className="space-y-2">
              {a.requestsByType.map((r) => {
                const max = a.requestsByType[0].count;
                return (
                  <li key={r.type} className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-900">{r.type}</span>
                      <span className="font-semibold">{r.count}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-ink-100">
                      <div className="h-2 rounded-full gradient-brand" style={{ width: `${(r.count / max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Most viewed projects">
          {a.topProjects.length === 0 ? (
            <p className="text-sm text-ink-500">No projects yet.</p>
          ) : (
            <ol className="divide-y divide-ink-100">
              {a.topProjects.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 py-2 text-sm">
                  <span className="w-5 text-ink-500">{i + 1}.</span>
                  <Link href={`/admin/projects/${p.id}`} className="flex-1 truncate font-medium text-ink-900 hover:text-brand-700">
                    {p.title}
                  </Link>
                  <StatusBadge value={p.publishStatus} />
                  <span className="w-12 text-right font-semibold">{p.views}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel title="Most viewed articles">
          {a.topPosts.length === 0 ? (
            <p className="text-sm text-ink-500">No posts yet.</p>
          ) : (
            <ol className="divide-y divide-ink-100">
              {a.topPosts.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 py-2 text-sm">
                  <span className="w-5 text-ink-500">{i + 1}.</span>
                  <Link href={`/admin/posts/${p.id}`} className="flex-1 truncate font-medium text-ink-900 hover:text-brand-700">
                    {p.title}
                  </Link>
                  <StatusBadge value={p.publishStatus} />
                  <span className="w-12 text-right font-semibold">{p.views}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel title="Projects by status">
          <ul className="flex flex-wrap gap-2">
            {a.projectsByStatus.map((s) => (
              <li key={s.status} className="rounded-xl border border-ink-200 px-4 py-2 text-sm">
                <span className="font-semibold text-ink-900">{s.count}</span> <span className="text-ink-500">{PROJECT_STATUS_LABELS[s.status as ProjectStatus] ?? s.status}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
