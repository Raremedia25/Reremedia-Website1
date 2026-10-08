import { NextResponse } from "next/server";
import { notify } from "@/lib/audit";
import { ATTACHMENT_MIME_TYPES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { adminNotifyAddress, sendMail } from "@/lib/mail";
import { isImageMime, maxUploadBytes, processAndStoreImage, storeAttachment } from "@/lib/media/process";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { flattenErrors, projectRequestSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`request:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: `Too many requests. Please try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.` }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const fields: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") fields[k] = v;

  const parsed = projectRequestSchema.safeParse(fields);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields.", errors: flattenErrors(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;
  if (data.website) return NextResponse.json({ ok: true, reference: "" });

  // Optional attachment.
  let attachmentId: string | null = null;
  const file = form.get("attachment");
  if (file instanceof File && file.size > 0) {
    if (!(ATTACHMENT_MIME_TYPES as readonly string[]).includes(file.type)) {
      return NextResponse.json({ error: "Unsupported attachment type.", errors: { attachment: "Use JPG, PNG, WebP or PDF." } }, { status: 400 });
    }
    if (file.size > maxUploadBytes()) {
      return NextResponse.json({ error: "Attachment too large.", errors: { attachment: `Maximum size is ${process.env.MAX_UPLOAD_MB ?? 10} MB.` } }, { status: 400 });
    }
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const stored = isImageMime(file.type)
        ? await processAndStoreImage(buffer, file.type, "requests")
        : { ...(await storeAttachment(buffer, file.type, "requests", "pdf")), width: null, height: null, variants: [], blurDataUrl: null };
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
          folder: "requests",
          alt: `Attachment from ${data.fullName}`,
        },
      });
      attachmentId = media.id;
    } catch (err) {
      return NextResponse.json({ error: "Could not store the attachment.", errors: { attachment: err instanceof Error ? err.message : "Upload failed." } }, { status: 400 });
    }
  }

  const request = await prisma.projectRequest.create({
    data: {
      fullName: data.fullName,
      company: data.company || null,
      email: data.email,
      phone: data.phone,
      projectType: data.projectType,
      budgetRange: data.budgetRange || null,
      description: data.description,
      features: data.features || null,
      deadline: data.deadline || null,
      referenceLinks: data.referenceLinks || null,
      attachmentId,
      ip,
    },
  });

  const reference = `RR-${request.id.slice(-6).toUpperCase()}`;
  await notify("request", `New project request: ${data.projectType}`, `${data.fullName}${data.company ? ` · ${data.company}` : ""}`, `/admin/requests/${request.id}`);

  const to = adminNotifyAddress();
  if (to) {
    await sendMail({
      to,
      replyTo: data.email,
      subject: `[Raremedia] New project request (${reference}): ${data.projectType}`,
      text: [
        `Reference: ${reference}`,
        `Name: ${data.fullName}`,
        `Company: ${data.company || "—"}`,
        `Email: ${data.email}`,
        `Phone: ${data.phone}`,
        `Type: ${data.projectType}`,
        `Budget: ${data.budgetRange || "—"}`,
        `Deadline: ${data.deadline || "—"}`,
        "",
        "Description:",
        data.description,
        "",
        "Features:",
        data.features || "—",
        "",
        `View in dashboard: ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/requests/${request.id}`,
      ].join("\n"),
    });
    await sendMail({
      to: data.email,
      subject: `We received your project request (${reference}) — Raremedia`,
      text: [`Dear ${data.fullName},`, "", `Thank you for your request. Your reference is ${reference}.`, "We will review it and get back to you shortly.", "", "Raremedia", "isaie.rare@gmail.com · +250 781 425 110"].join("\n"),
    });
  }

  return NextResponse.json({ ok: true, reference });
}
