// Serverless contact-form mailer for the public site.
// Mirrors backend/ (the Spring Boot mailer used for local/self-hosted runs):
// sends a notification to the company inbox and an acknowledgment to the client.
// Credentials come from Netlify environment variables — never from code.
import nodemailer from 'nodemailer';

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export default async (req) => {
  if (req.method !== 'POST') {
    return json(405, { success: false, error: 'Method not allowed.' });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { success: false, error: 'Invalid request.' });
  }

  const fullName = (body.fullName || '').trim().slice(0, 120);
  const email = (body.email || '').trim().slice(0, 160);
  const phone = (body.phone || '').trim().slice(0, 40);
  const company = (body.company || '').trim().slice(0, 160);
  const service = (body.service || '').trim().slice(0, 120);
  const message = (body.message || '').trim().slice(0, 5000);

  if (!fullName || !phone || !service || !message) {
    return json(400, { success: false, error: 'Please fill in all required fields.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json(400, { success: false, error: 'Invalid email address.' });
  }

  const user = process.env.MAIL_USERNAME;
  const pass = process.env.MAIL_PASSWORD;
  const inbox = process.env.COMPANY_INBOX || user;
  if (!user || !pass) {
    return json(500, { success: false, error: 'Mailer is not configured.' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: user,
    to: inbox,
    replyTo: email,
    subject: `New service request — ${service} — ${fullName}`,
    text: [
      'New contact request from the RAREMEDIA website:',
      '',
      `Name:     ${fullName}`,
      `Email:    ${email}`,
      `Phone:    ${phone}`,
      `Company:  ${company || '—'}`,
      `Service:  ${service}`,
      '',
      'Message:',
      message,
    ].join('\n'),
  });

  try {
    await transporter.sendMail({
      from: user,
      to: email,
      subject: 'We received your request — RAREMEDIA',
      text: [
        `Dear ${fullName},`,
        '',
        'Thank you for contacting RAREMEDIA. We have received your request',
        `regarding "${service}" and our team will get back to you as soon as`,
        'possible, usually within one business day.',
        '',
        'Your message:',
        message,
        '',
        'Best regards,',
        'The RAREMEDIA Team',
        `${inbox} | +250 781 425 110`,
      ].join('\n'),
    });
  } catch {
    // Acknowledgment is best-effort; the notification already went out.
  }

  return json(200, { success: true });
};

export const config = { path: '/api/contact' };
