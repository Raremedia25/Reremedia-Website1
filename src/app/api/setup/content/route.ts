import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pendingSeedProjects, seedOneProject } from "@/lib/seed/content";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function tokenMatches(header: string | null): boolean {
  const expected = process.env.SETUP_TOKEN;
  if (!expected || expected.length < 16 || !header) return false;
  const a = Buffer.from(header.replace(/^Bearer\s+/i, ""));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * One-shot import of the portfolio projects in prisma/seed-data.ts, using the
 * runtime database and media credentials (the Netlify CLI/API only expose a
 * read-only database role). Inert unless SETUP_TOKEN is set; it only ever adds
 * projects whose slug does not exist yet and never changes existing content.
 *
 *   POST /api/setup/content            -> { pending: [slugs] }
 *   POST /api/setup/content?slug=<s>   -> imports that one project
 *
 * One project per call keeps each request well inside the function timeout.
 * Remove SETUP_TOKEN after use.
 */
export async function POST(request: Request) {
  if (!process.env.SETUP_TOKEN) return new NextResponse("Not found", { status: 404 });
  if (!tokenMatches(request.headers.get("authorization"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pending = await pendingSeedProjects(prisma);
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ pending: pending.map((p) => p.slug), total: await prisma.project.count() });

  const project = pending.find((p) => p.slug === slug);
  if (!project) return NextResponse.json({ ok: true, skipped: true, reason: "Already imported or not a seed project." });

  const author = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" }, orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!author) return NextResponse.json({ error: "No Super Admin exists yet. Run /api/setup first." }, { status: 409 });
  const categories = await prisma.category.findMany({ where: { type: "project" }, select: { id: true, slug: true } });
  const categoryMap = Object.fromEntries(categories.map((c) => [`project:${c.slug}`, c.id]));

  try {
    const line = await seedOneProject(prisma, project, categoryMap, author.id);
    return NextResponse.json({ ok: true, imported: line, remaining: pending.length - 1 });
  } catch (err) {
    console.error("[setup.content]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Import failed." }, { status: 500 });
  }
}
