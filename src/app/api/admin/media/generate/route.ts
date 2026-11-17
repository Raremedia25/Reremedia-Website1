import { NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { ImageGenerationError, generateImage, imageGenerationConfigured } from "@/lib/ai/image";
import { assertPermission, AuthError } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/media/dto";
import { processAndStoreImage } from "@/lib/media/process";
import { rateLimit } from "@/lib/rate-limit";

// Generation can take a while; allow the function its full window.
export const maxDuration = 120;

const schema = z.object({
  prompt: z.string().trim().min(10, "Describe the image in at least 10 characters.").max(1000, "Keep the description under 1000 characters."),
  folder: z.string().trim().max(60).optional().default("general"),
});

/** GET /api/admin/media/generate — is AI generation set up? (never reveals the key) */
export async function GET() {
  try {
    await assertPermission("media:manage");
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: err instanceof AuthError ? err.status : 500 });
  }
  return NextResponse.json({ configured: imageGenerationConfigured() });
}

/** POST /api/admin/media/generate — create one AI-generated image and add it to the library. */
export async function POST(req: Request) {
  let user;
  try {
    user = await assertPermission("media:manage");
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: err instanceof AuthError ? err.status : 500 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });

  // Every image costs money at the provider: cap each admin at 20 per hour.
  const limit = rateLimit(`imagegen:${user.id}`, 20, 60 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ error: `Generation limit reached. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.` }, { status: 429 });

  const { prompt } = parsed.data;
  const folder = parsed.data.folder.toLowerCase().replace(/[^a-z0-9-_]/g, "") || "general";
  try {
    const image = await generateImage(prompt);
    const stored = await processAndStoreImage(image.buffer, image.mime, folder);
    const media = await prisma.media.create({
      data: {
        provider: process.env.STORAGE_PROVIDER ?? "local",
        storageKey: stored.storageKey,
        url: stored.url,
        originalName: `ai-${Date.now().toString(36)}.jpg`,
        mimeType: stored.mimeType,
        size: stored.size,
        width: stored.width,
        height: stored.height,
        variants: JSON.stringify(stored.variants),
        blurDataUrl: stored.blurDataUrl,
        folder,
        alt: prompt.slice(0, 300),
        source: "AI_GENERATED",
        uploadedById: user.id,
      },
    });
    await audit(user, "media.generate", "media", media.id, { model: image.model, prompt: prompt.slice(0, 200) });
    return NextResponse.json({ item: toMediaDTO(media) }, { status: 201 });
  } catch (err) {
    if (err instanceof ImageGenerationError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[media.generate]", err);
    return NextResponse.json({ error: "Could not save the generated image." }, { status: 500 });
  }
}
