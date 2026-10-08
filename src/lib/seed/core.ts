import type { PrismaClient } from "@prisma/client";
import { POST_CATEGORIES, PROJECT_CATEGORIES, SERVICES, SETTINGS } from "../../../prisma/seed-data";
import { hashPassword } from "@/lib/auth/password";

export interface SeedAdmin {
  name: string;
  email: string;
  password: string;
}

export interface SeedCoreResult {
  user: { id: string; email: string; created: boolean };
  categoryMap: Record<string, string>;
  categories: number;
  services: number;
}

/**
 * Idempotent "core" seed shared by `prisma/seed.ts` (local / CLI) and the
 * one-shot `/api/setup` endpoint (runs inside Netlify with the runtime database
 * credentials): first Super Admin, categories, services and site settings.
 * No images or demo content here, so it finishes well within a function timeout.
 */
export async function seedCore(prisma: PrismaClient, admin: SeedAdmin, log: (line: string) => void = () => {}): Promise<SeedCoreResult> {
  const email = admin.email.trim().toLowerCase();
  let created = false;
  let user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    log(`• Super Admin already exists: ${email}`);
  } else {
    user = await prisma.user.create({
      data: { name: admin.name.trim(), email, role: "SUPER_ADMIN", passwordHash: await hashPassword(admin.password) },
    });
    created = true;
    log(`• Created Super Admin ${email}`);
  }

  const categoryMap: Record<string, string> = {};
  let i = 0;
  for (const c of PROJECT_CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug_type: { slug: c.slug, type: "project" } },
      update: { name: c.name, description: c.description, order: i },
      create: { ...c, type: "project", order: i },
    });
    categoryMap[`project:${c.slug}`] = row.id;
    i++;
  }
  i = 0;
  for (const c of POST_CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug_type: { slug: c.slug, type: "post" } },
      update: { name: c.name, order: i },
      create: { ...c, type: "post", order: i },
    });
    categoryMap[`post:${c.slug}`] = row.id;
    i++;
  }
  log(`• Categories: ${PROJECT_CATEGORIES.length} project, ${POST_CATEGORIES.length} post`);

  i = 0;
  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: { name: s.name, icon: s.icon, summary: s.summary, items: JSON.stringify(s.items), order: i },
      create: { ...s, items: JSON.stringify(s.items), order: i },
    });
    i++;
  }
  log(`• Services: ${SERVICES.length}`);

  for (const [key, value] of Object.entries(SETTINGS)) {
    await prisma.siteSetting.upsert({ where: { key }, update: {}, create: { key, value } });
  }
  log("• Site settings seeded (existing values kept)");

  return {
    user: { id: user.id, email: user.email, created },
    categoryMap,
    categories: PROJECT_CATEGORIES.length + POST_CATEGORIES.length,
    services: SERVICES.length,
  };
}
