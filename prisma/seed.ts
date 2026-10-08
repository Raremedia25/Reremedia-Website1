/**
 * Seed script: creates the first Super Admin, categories, services, site
 * settings and demo portfolio content (projects, images, posts).
 *
 *   npm run db:seed            # safe to re-run; skips content that exists
 *   npm run db:seed -- --force # re-creates demo projects/posts/images
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import { resolveDatabaseUrl } from "../src/lib/db";
import { processAndStoreImage } from "../src/lib/media/process";
import { seedCore } from "../src/lib/seed/core";
import { ILLUSTRATIONS, renderIllustration } from "./illustrations";
import { POSTS, PROJECTS, type SeedProject } from "./seed-data";

const prisma = new PrismaClient({ datasourceUrl: resolveDatabaseUrl() });
const force = process.argv.includes("--force");
const LEGACY_ASSETS = path.resolve(process.cwd(), "legacy/src/assets/projects");

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Generate a branded placeholder cover (clearly marked as a demo image). */
async function placeholderCover(project: SeedProject): Promise<Buffer> {
  const [c1, c2] = project.accent;
  const title = escapeXml(project.title);
  const words = title.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > 24) {
      lines.push(line.trim());
      line = w;
    } else line = `${line} ${w}`;
  }
  if (line.trim()) lines.push(line.trim());
  const top = 600 - Math.round((lines.length * 86) / 2);
  const titleSvg = lines.map((l, i) => `<text x="200" y="${top + 60 + i * 86}" font-family="Segoe UI, Arial, sans-serif" font-size="72" font-weight="800" fill="#ffffff">${l}</text>`).join("");
  const chips = project.features
    .slice(0, 4)
    .map((f, i) => {
      const w = Math.min(420, f.length * 15 + 48);
      const x = 200 + i * 20 + (i > 0 ? project.features.slice(0, i).reduce((s, ff) => s + Math.min(420, ff.length * 15 + 48), 0) : 0);
      if (x + w > 1400) return "";
      return `<rect x="${x}" y="${top + 90 + lines.length * 86}" width="${w}" height="54" rx="27" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)"/><text x="${x + 24}" y="${top + 126 + lines.length * 86}" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="600" fill="#ffffff">${escapeXml(f)}</text>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0c0a1d"/><stop offset="1" stop-color="#1f1a45"/></linearGradient>
    <linearGradient id="ac" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="rgba(255,255,255,0.06)"/></pattern>
    <radialGradient id="glow" cx="0.85" cy="0.2" r="0.6"><stop offset="0" stop-color="${c2}" stop-opacity="0.55"/><stop offset="1" stop-color="${c2}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="1200" fill="url(#bg)"/>
  <rect width="1600" height="1200" fill="url(#grid)"/>
  <rect width="1600" height="1200" fill="url(#glow)"/>
  <circle cx="1350" cy="900" r="420" fill="${c1}" opacity="0.25"/>
  <rect x="200" y="200" width="64" height="64" rx="16" fill="url(#ac)"/>
  <text x="216" y="246" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="800" fill="#fff">R</text>
  <text x="288" y="244" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="700" fill="#fff">Raremedia</text>
  <rect x="200" y="${top - 70}" width="200" height="12" rx="6" fill="url(#ac)"/>
  <text x="200" y="${top - 10}" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="600" fill="${c2}" letter-spacing="4">${escapeXml(project.category.toUpperCase().replace(/-/g, " "))}</text>
  ${titleSvg}
  ${chips}
  <g transform="translate(1000,230)" opacity="0.9">
    <rect width="500" height="330" rx="24" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.15)"/>
    <rect x="24" y="24" width="140" height="80" rx="14" fill="url(#ac)"/>
    <rect x="180" y="24" width="140" height="80" rx="14" fill="rgba(255,255,255,0.12)"/>
    <rect x="336" y="24" width="140" height="80" rx="14" fill="rgba(255,255,255,0.12)"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${24 + i * 58}" y="${300 - 40 - (i * 23 + 30)}" width="40" height="${i * 23 + 30}" rx="6" fill="url(#ac)" opacity="${0.5 + i * 0.06}"/>`).join("")}
  </g>
  <text x="200" y="1010" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.55)">Demo cover image · replace with real screenshots from the admin dashboard</text>
</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

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

async function createMedia(buffer: Buffer, mime: string, originalName: string, alt: string, caption: string, isDemo: boolean, userId: string) {
  const stored = await processAndStoreImage(buffer, mime, "projects");
  return prisma.media.create({
    data: {
      provider: process.env.STORAGE_PROVIDER ?? "local",
      storageKey: stored.storageKey,
      url: stored.url,
      originalName,
      mimeType: stored.mimeType,
      size: stored.size,
      width: stored.width,
      height: stored.height,
      variants: JSON.stringify(stored.variants),
      blurDataUrl: stored.blurDataUrl,
      folder: "projects",
      alt,
      caption,
      isDemo,
      uploadedById: userId,
    },
  });
}

async function seedProjects(categoryMap: Record<string, string>, userId: string) {
  const count = await prisma.project.count();
  if (count > 0 && !force) {
    console.log(`• Projects already exist (${count}); skipping demo projects. Use --force to recreate.`);
    return;
  }
  if (force) {
    await prisma.project.deleteMany({ where: { slug: { in: PROJECTS.map((p) => p.slug) } } });
    const demo = await prisma.media.findMany({ where: { isDemo: true }, select: { id: true } });
    const { deleteMediaCompletely } = await import("../src/lib/media/process");
    for (const m of demo) await deleteMediaCompletely(m.id);
  }
  for (const p of PROJECTS) {
    let buffer: Buffer | null = null;
    let mime = "image/png";
    let isDemo = true;
    let originalName = `${p.slug}-cover.png`;
    if (p.screenshot) {
      try {
        buffer = await fs.readFile(path.join(LEGACY_ASSETS, p.screenshot));
        isDemo = false;
        originalName = p.screenshot;
        mime = p.screenshot.endsWith(".jpg") || p.screenshot.endsWith(".jpeg") ? "image/jpeg" : "image/png";
      } catch {
        console.warn(`  ! screenshot ${p.screenshot} not found, generating placeholder`);
      }
    }
    if (!buffer) buffer = await placeholderCover(p);
    const media = await createMedia(buffer, mime, originalName, `${p.title} – ${isDemo ? "demo cover image" : "screenshot"}`, p.caption ?? (isDemo ? "Demo cover image. Replace with real screenshots from the admin dashboard." : ""), isDemo, userId);

    const publishedAt = new Date(Date.now() - p.order * 86400000 * 7);
    await prisma.project.create({
      data: {
        title: p.title,
        slug: p.slug,
        summary: p.summary,
        content: p.content,
        categoryId: categoryMap[`project:${p.category}`] ?? null,
        projectStatus: p.projectStatus,
        publishStatus: "PUBLISHED",
        publishedAt,
        clientType: p.clientType ?? null,
        completedAt: p.projectStatus === "COMPLETED" ? publishedAt : null,
        features: JSON.stringify(p.features),
        technologies: JSON.stringify(p.technologies),
        featuredImageId: media.id,
        isFeatured: !!p.isFeatured,
        order: p.order,
        authorId: userId,
        images: { create: [{ mediaId: media.id, order: 0, caption: media.caption || null }] },
      },
    });
    console.log(`  ✓ ${p.title}${isDemo ? " (demo cover)" : " (screenshot)"}`);
  }
  console.log(`• Projects: ${PROJECTS.length}`);
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
