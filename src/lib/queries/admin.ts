import { prisma } from "@/lib/db";

/** Dashboard statistics and recent activity. */
export async function getDashboardStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [
    totalProjects,
    publishedProjects,
    draftProjects,
    totalPosts,
    publishedPosts,
    totalImages,
    contactTotal,
    contactNew,
    requestTotal,
    requestNew,
    requestsThisMonth,
    messagesThisMonth,
    recentActivity,
    notifications,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { publishStatus: "PUBLISHED" } }),
    prisma.project.count({ where: { publishStatus: "DRAFT" } }),
    prisma.post.count(),
    prisma.post.count({ where: { publishStatus: "PUBLISHED" } }),
    prisma.media.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.projectRequest.count(),
    prisma.projectRequest.count({ where: { status: "NEW" } }),
    prisma.projectRequest.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.contactMessage.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.notification.findMany({ where: { isRead: false }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  return {
    totalProjects,
    publishedProjects,
    draftProjects,
    totalPosts,
    publishedPosts,
    totalImages,
    contactTotal,
    contactNew,
    requestTotal,
    requestNew,
    requestsThisMonth,
    messagesThisMonth,
    recentActivity,
    notifications,
  };
}

/** Simple analytics derived from stored data (no third-party tracker). */
export async function getAnalytics() {
  const [topProjects, topPosts, requests, messages, requestsByType, projectsByStatus] = await Promise.all([
    prisma.project.findMany({ orderBy: { views: "desc" }, take: 8, select: { id: true, title: true, slug: true, views: true, publishStatus: true } }),
    prisma.post.findMany({ orderBy: { views: "desc" }, take: 8, select: { id: true, title: true, slug: true, views: true, publishStatus: true } }),
    prisma.projectRequest.findMany({ select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
    prisma.contactMessage.findMany({ select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
    prisma.projectRequest.groupBy({ by: ["projectType"], _count: { _all: true }, orderBy: { _count: { projectType: "desc" } } }),
    prisma.project.groupBy({ by: ["projectStatus"], _count: { _all: true } }),
  ]);

  // Monthly buckets for the last 6 months.
  const months: Array<{ key: string; label: string; requests: number; messages: number }> = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }), requests: 0, messages: 0 });
  }
  const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
  for (const r of requests) {
    const m = months.find((x) => x.key === keyOf(r.createdAt));
    if (m) m.requests++;
  }
  for (const r of messages) {
    const m = months.find((x) => x.key === keyOf(r.createdAt));
    if (m) m.messages++;
  }

  const totalProjectViews = topProjects.reduce((s, p) => s + p.views, 0);
  const totalPostViews = topPosts.reduce((s, p) => s + p.views, 0);

  return {
    topProjects,
    topPosts,
    months,
    requestsByType: requestsByType.map((r) => ({ type: r.projectType, count: r._count._all })),
    projectsByStatus: projectsByStatus.map((r) => ({ status: r.projectStatus, count: r._count._all })),
    totalProjectViews,
    totalPostViews,
  };
}
