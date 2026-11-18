/**
 * Demo portfolio content (projects + their images), shared by `prisma/seed.ts`
 * (local / CLI) and the one-shot `/api/setup/content` endpoint, which runs
 * inside Netlify with the runtime database and Blobs credentials.
 *
 * Images that contain text (placeholder covers, sector illustrations) are
 * pre-rendered into prisma/seed-assets by `npm run db:seed:assets`, because
 * serverless functions have no fonts to render SVG text with.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import { processAndStoreImage } from "@/lib/media/process";
import { SECTOR_SCENES, renderIllustration } from "../../../prisma/illustrations";
import { PROJECTS, type SeedProject } from "../../../prisma/seed-data";

const LEGACY_ASSETS = path.resolve(process.cwd(), "legacy/src/assets/projects");
export const SEED_ASSETS = path.resolve(process.cwd(), "prisma/seed-assets");

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Generate a branded placeholder cover (clearly marked as a demo image). */
export async function placeholderCover(project: SeedProject): Promise<Buffer> {
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

async function prebuilt(name: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(path.join(SEED_ASSETS, name));
  } catch {
    return null;
  }
}

export const coverAssetName = (slug: string) => `${slug}-cover.png`;
export const sceneAssetName = (scene: string) => `scene-${scene}.png`;

async function createMedia(prisma: PrismaClient, buffer: Buffer, mime: string, originalName: string, alt: string, caption: string, isDemo: boolean, userId: string, source = "UPLOAD") {
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
      source,
      uploadedById: userId,
    },
  });
}

/** Create one seed project with its cover/screenshot and sector illustration. Returns a one-line description. */
export async function seedOneProject(prisma: PrismaClient, p: SeedProject, categoryMap: Record<string, string>, userId: string): Promise<string> {
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
  // Sector illustration: shows what the system is used for. It becomes the
  // cover when there is no real screenshot, and always joins the gallery.
  const scene = p.scene ? SECTOR_SCENES[p.scene] : null;
  const sceneMedia = scene && p.scene ? await createMedia(prisma, (await prebuilt(sceneAssetName(p.scene))) ?? (await renderIllustration(scene.svg)), "image/png", `${p.slug}-illustration.png`, scene.alt, scene.caption, false, userId, "ILLUSTRATION") : null;
  const media =
    buffer || !sceneMedia
      ? await createMedia(
          prisma,
          buffer ?? (await prebuilt(coverAssetName(p.slug))) ?? (await placeholderCover(p)),
          mime,
          originalName,
          `${p.title} – ${isDemo ? "demo cover image" : "screenshot"}`,
          p.caption ?? (isDemo ? "Demo cover image. Replace with real screenshots from the admin dashboard." : ""),
          isDemo,
          userId,
        )
      : sceneMedia;
  if (media === sceneMedia) isDemo = false;
  const images = [
    { mediaId: media.id, order: 0, kind: p.screenshot && media !== sceneMedia ? "SCREENSHOT" : "GALLERY", caption: media.caption || null },
    ...(sceneMedia && sceneMedia !== media ? [{ mediaId: sceneMedia.id, order: 1, kind: "GALLERY", caption: sceneMedia.caption }] : []),
  ];

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
      demoKey: p.demoKey ?? null,
      featuredImageId: media.id,
      isFeatured: !!p.isFeatured,
      order: p.order,
      authorId: userId,
      images: { create: images },
    },
  });
  return `${p.title}${media === sceneMedia ? " (illustration)" : isDemo ? " (demo cover)" : " (screenshot)"}`;
}

/** Seed projects whose slug is not in the database yet. */
export async function pendingSeedProjects(prisma: PrismaClient): Promise<SeedProject[]> {
  const existing = new Set((await prisma.project.findMany({ select: { slug: true } })).map((x) => x.slug));
  return PROJECTS.filter((p) => !existing.has(p.slug));
}
