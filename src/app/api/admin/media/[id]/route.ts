import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { assertPermission, AuthError } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/media/dto";
import { isImageMime, processAndStoreImage, type MediaVariant } from "@/lib/media/process";
import { parseJson } from "@/lib/json";
import { storageByName } from "@/lib/storage";
import { revalidatePublic } from "@/lib/actions-shared";

/**
 * POST /api/admin/media/[id] — replace the binary of an existing image while
 * keeping its id (so every project/post using it updates automatically).
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await assertPermission("media:manage");
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: err instanceof AuthError ? err.status : 500 });
  }
  const { id } = await ctx.params;
  const existing = await prisma.media.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Image not found." }, { status: 404 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (!isImageMime(file.type)) return NextResponse.json({ error: "Unsupported type. Use JPG, PNG or WebP." }, { status: 400 });

  try {
    const stored = await processAndStoreImage(Buffer.from(await file.arrayBuffer()), file.type, existing.folder);
    // Remove old binaries (best effort) after the new ones are safely stored.
    const oldStorage = storageByName(existing.provider);
    const oldVariants = parseJson<MediaVariant[]>(existing.variants, []);
    await Promise.allSettled([oldStorage.delete(existing.storageKey), ...oldVariants.map((v) => oldStorage.delete(v.key))]);

    const updated = await prisma.media.update({
      where: { id },
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
        isDemo: false,
      },
    });
    await audit(user, "media.replace", "media", id, { name: file.name });
    revalidatePublic("all");
    return NextResponse.json({ item: toMediaDTO(updated) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Replace failed." }, { status: 400 });
  }
}
