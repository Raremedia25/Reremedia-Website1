import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { audit } from "@/lib/audit";
import { assertPermission, AuthError } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/media/dto";
import { isImageMime, processAndStoreImage } from "@/lib/media/process";

const PAGE_SIZE = 40;

/** GET /api/admin/media?q=&folder=&page= — list images for pickers. */
export async function GET(req: Request) {
  try {
    await assertPermission("media:manage");
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: err instanceof AuthError ? err.status : 500 });
  }
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const folder = url.searchParams.get("folder")?.trim() ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const where: Prisma.MediaWhereInput = { mimeType: { startsWith: "image/" } };
  if (folder) where.folder = folder;
  if (q) where.OR = [{ originalName: { contains: q, mode: "insensitive" } }, { alt: { contains: q, mode: "insensitive" } }, { caption: { contains: q, mode: "insensitive" } }];
  const [items, total] = await Promise.all([
    prisma.media.findMany({ where, orderBy: { createdAt: "desc" }, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    prisma.media.count({ where }),
  ]);
  return NextResponse.json({ items: items.map(toMediaDTO), total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) });
}

/** POST /api/admin/media — multipart upload of one or more images. */
export async function POST(req: Request) {
  let user;
  try {
    user = await assertPermission("media:manage");
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: err instanceof AuthError ? err.status : 500 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  const folder = String(form.get("folder") ?? "general").slice(0, 60) || "general";
  const alt = String(form.get("alt") ?? "").slice(0, 300);
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return NextResponse.json({ error: "No files received." }, { status: 400 });
  if (files.length > 20) return NextResponse.json({ error: "Upload at most 20 images at a time." }, { status: 400 });

  const created = [];
  const failed: Array<{ name: string; error: string }> = [];
  for (const file of files) {
    try {
      if (!isImageMime(file.type)) throw new Error("Unsupported type. Use JPG, PNG or WebP.");
      const buffer = Buffer.from(await file.arrayBuffer());
      const stored = await processAndStoreImage(buffer, file.type, folder);
      const media = await prisma.media.create({
        data: {
          provider: process.env.STORAGE_PROVIDER ?? "local",
          storageKey: stored.storageKey,
          url: stored.url,
          originalName: file.name.slice(0, 200),
          mimeType: stored.mimeType,
          size: stored.size,
          width: stored.width,
          height: stored.height,
          variants: JSON.stringify(stored.variants),
          blurDataUrl: stored.blurDataUrl,
          folder,
          alt: alt || file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "),
          uploadedById: user.id,
        },
      });
      created.push(toMediaDTO(media));
    } catch (err) {
      failed.push({ name: file.name, error: err instanceof Error ? err.message : "Upload failed." });
    }
  }
  if (created.length) await audit(user, "media.upload", "media", null, { count: created.length, folder });
  return NextResponse.json({ items: created, failed }, { status: created.length ? 201 : 400 });
}
