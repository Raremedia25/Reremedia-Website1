import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { seedCore } from "@/lib/seed/core";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().max(120),
  password: z.string().min(8).max(200),
});

function tokenMatches(header: string | null): boolean {
  const expected = process.env.SETUP_TOKEN;
  if (!expected || expected.length < 16 || !header) return false;
  const given = header.replace(/^Bearer\s+/i, "");
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * One-shot bootstrap for a fresh deployment: creates the first Super Admin,
 * categories, services and settings using the runtime database credentials
 * (the Netlify CLI/API only expose a read-only role). It is inert unless
 * SETUP_TOKEN is set *and* no user exists yet, so it cannot be used to add
 * accounts to a live site. Remove SETUP_TOKEN after use.
 *
 *   curl -X POST https://<site>/api/setup \
 *     -H "Authorization: Bearer $SETUP_TOKEN" -H "Content-Type: application/json" \
 *     -d '{"name":"...","email":"...","password":"..."}'
 */
export async function POST(request: Request) {
  if (!process.env.SETUP_TOKEN) return new NextResponse("Not found", { status: 404 });
  if (!tokenMatches(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((await prisma.user.count()) > 0) {
    return NextResponse.json({ error: "Setup already completed: a user account exists." }, { status: 409 });
  }
  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body: name, email and password (min 8 chars) are required." }, { status: 400 });
  }
  const lines: string[] = [];
  const result = await seedCore(prisma, parsed.data, (line) => lines.push(line));
  return NextResponse.json({ ok: true, admin: result.user.email, categories: result.categories, services: result.services, log: lines });
}
