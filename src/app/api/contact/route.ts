import { NextResponse } from "next/server";
import { notify } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { adminNotifyAddress, sendMail } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { contactSchema, flattenErrors } from "@/lib/validation";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: `Too many messages. Please try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.` }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields.", errors: flattenErrors(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;
  if (data.website) {
    // Honeypot filled: pretend success without storing anything.
    return NextResponse.json({ ok: true });
  }

  const message = await prisma.contactMessage.create({
    data: { name: data.name, email: data.email, phone: data.phone || null, subject: data.subject, message: data.message, ip },
  });

  await notify("contact", `New message from ${data.name}`, data.subject, `/admin/messages/${message.id}`);

  const to = adminNotifyAddress();
  if (to) {
    await sendMail({
      to,
      replyTo: data.email,
      subject: `[Raremedia] New contact message: ${data.subject}`,
      text: [`Name: ${data.name}`, `Email: ${data.email}`, `Phone: ${data.phone || "—"}`, "", data.message, "", `View in dashboard: ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/messages/${message.id}`].join("\n"),
    });
  }

  return NextResponse.json({ ok: true });
}
