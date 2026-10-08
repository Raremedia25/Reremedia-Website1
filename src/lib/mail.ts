import nodemailer from "nodemailer";

interface MailMessage {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

function transporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT ?? 587);
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

/**
 * Send an email if SMTP is configured; otherwise log it. Never throws, so
 * a mail failure can never break a form submission.
 */
export async function sendMail(message: MailMessage): Promise<boolean> {
  const tx = transporter();
  if (!tx) {
    console.info(`[mail] SMTP not configured. Would send to ${message.to}: ${message.subject}`);
    return false;
  }
  try {
    await tx.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: message.to,
      subject: message.subject,
      text: message.text,
      replyTo: message.replyTo,
    });
    return true;
  } catch (err) {
    console.error("[mail] send failed", err);
    return false;
  }
}

export function adminNotifyAddress(): string | null {
  return process.env.NOTIFY_EMAIL || process.env.SMTP_USER || null;
}
