/**
 * Seed script: creates the first Super Admin, categories, services, site
 * settings and demo portfolio content (projects, images, posts).
 *
 *   npm run db:seed            # safe to re-run; skips content that exists
 *   npm run db:seed -- --force # re-creates demo projects/posts/images
 *   npm run db:seed -- --add-missing # only adds seed projects whose slug does not exist yet
 */
import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "../src/lib/db";
import { processAndStoreImage } from "../src/lib/media/process";
import { seedCore } from "../src/lib/seed/core";
import { seedOneProject } from "../src/lib/seed/content";
import { ILLUSTRATIONS, renderIllustration } from "./illustrations";
import { POSTS, PROJECTS } from "./seed-data";

const prisma = new PrismaClient({ datasourceUrl: resolveDatabaseUrl() });
const force = process.argv.includes("--force");
const addMissing = process.argv.includes("--add-missing");

/** Admin, categories, services and settings live in src/lib/seed/core.ts (shared with /api/setup). */
async function seedBase() {
  return seedCore(
    prisma,
    {
      name: process.env.SEED_ADMIN_NAME ?? "Raremedia Admin",
      email: process.env.SEED_ADMIN_EMAIL ?? "admin@raremedia.local",
      password: process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!",
    },
    (line) => console.log(line),
  );
}

async function seedProjects(categoryMap: Record<string, string>, userId: string) {
  const count = await prisma.project.count();
  if (count > 0 && !force && !addMissing) {
    console.log(`• Projects already exist (${count}); skipping demo projects. Use --add-missing to add new seed projects or --force to recreate.`);
    return;
  }
  const existingSlugs = new Set(force ? [] : (await prisma.project.findMany({ select: { slug: true } })).map((p) => p.slug));
  if (force) {
    await prisma.project.deleteMany({ where: { slug: { in: PROJECTS.map((p) => p.slug) } } });
    const demo = await prisma.media.findMany({ where: { isDemo: true }, select: { id: true } });
    const { deleteMediaCompletely } = await import("../src/lib/media/process");
    for (const m of demo) await deleteMediaCompletely(m.id);
  }
  let created = 0;
  for (const p of PROJECTS) {
    if (existingSlugs.has(p.slug)) continue;
    created++;
    console.log(`  ✓ ${await seedOneProject(prisma, p, categoryMap, userId)}`);
  }
  console.log(`• Projects: ${created} created${existingSlugs.size ? `, ${PROJECTS.length - created} already present` : ""}`);
}

async function seedPosts(categoryMap: Record<string, string>, userId: string) {
  const count = await prisma.post.count();
  if (count > 0 && !force) {
    console.log(`• Posts already exist (${count}); skipping demo posts.`);
    return;
  }
  if (force) await prisma.post.deleteMany({ where: { slug: { in: POSTS.map((p) => p.slug) } } });
  // Reuse project covers as featured images for demo posts.
  const covers = await prisma.media.findMany({ where: { folder: "projects" }, orderBy: { createdAt: "asc" }, take: 3 });
  let i = 0;
  for (const p of POSTS) {
    await prisma.post.create({
      data: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        type: p.type,
        categoryId: categoryMap[`post:${p.category}`] ?? null,
        tags: JSON.stringify(p.tags),
        featuredImageId: covers[i % covers.length]?.id ?? null,
        authorId: userId,
        publishStatus: "PUBLISHED",
        publishedAt: new Date(Date.now() - i * 86400000 * 3),
      },
    });
    i++;
  }
  console.log(`• Posts: ${POSTS.length} (demo)`);
}

/** Client-journey illustrations (media folder "journey") + an explanatory blog post. */
async function seedIllustrations(categoryMap: Record<string, string>, userId: string) {
  const existing = await prisma.media.count({ where: { folder: "journey" } });
  if (existing > 0 && !force) {
    console.log(`• Journey illustrations already exist (${existing}); skipping.`);
    return;
  }
  if (force) {
    const old = await prisma.media.findMany({ where: { folder: "journey" }, select: { id: true } });
    const { deleteMediaCompletely } = await import("../src/lib/media/process");
    for (const m of old) await deleteMediaCompletely(m.id);
    await prisma.post.deleteMany({ where: { slug: "how-to-work-with-raremedia" } });
  }
  const created = [];
  for (const ill of ILLUSTRATIONS) {
    const png = await renderIllustration(ill.svg);
    const stored = await processAndStoreImage(png, "image/png", "journey");
    const media = await prisma.media.create({
      data: {
        provider: process.env.STORAGE_PROVIDER ?? "local",
        storageKey: stored.storageKey,
        url: stored.url,
        originalName: `journey-${ill.key}.png`,
        mimeType: stored.mimeType,
        size: stored.size,
        width: stored.width,
        height: stored.height,
        variants: JSON.stringify(stored.variants),
        blurDataUrl: stored.blurDataUrl,
        folder: "journey",
        alt: ill.alt,
        caption: ill.caption,
        isDemo: false,
        uploadedById: userId,
      },
    });
    created.push(media);
    // Keep createdAt strictly increasing so the homepage order is stable.
    await new Promise((r) => setTimeout(r, 20));
  }
  const post = await prisma.post.findUnique({ where: { slug: "how-to-work-with-raremedia" } });
  if (!post) {
    await prisma.post.create({
      data: {
        title: "How to work with Raremedia: from your first message to a system you rely on",
        slug: "how-to-work-with-raremedia",
        excerpt: "Five simple steps: ask for a service, plan together, build and review, launch with training, and grow with long-term support.",
        type: "TUTORIAL",
        categoryId: categoryMap["post:tutorials"] ?? null,
        tags: JSON.stringify(["how it works", "process", "clients"]),
        featuredImageId: created[0]?.id ?? null,
        authorId: userId,
        publishStatus: "PUBLISHED",
        publishedAt: new Date(),
        content: [
          "Many people ask us the same question before their first project: *what actually happens after I contact you?* Here is the whole journey, step by step.",
          "",
          ...ILLUSTRATIONS.map((ill, i) => `## ${i + 1}. ${ill.alt}

${ill.caption}`),
          "",
          "## Ready to start?",
          "",
          "[Request a project](/request-project), [send us a message](/contact) or WhatsApp us at +250 781 425 110. We reply within one business day.",
          "",
          "*The images in this article are illustrations.*",
        ].join("\n"),
        images: { create: created.map((m, i) => ({ mediaId: m.id, order: i, caption: m.caption })) },
      },
    });
  }
  console.log(`• Journey illustrations: ${created.length} (+ blog post)`);
}

async function main() {
  console.log("Seeding Raremedia platform…");
  const { user, categoryMap } = await seedBase();
  await seedProjects(categoryMap, user.id);
  await seedPosts(categoryMap, user.id);
  await seedIllustrations(categoryMap, user.id);
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
