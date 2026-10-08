import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Raremedia handles the information you share through this website.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" description="How we handle the information you share with us through this website." />
      <section className="section">
        <div className="container-x">
          <div className="prose-rr max-w-3xl">
            <h2>Information we collect</h2>
            <p>
              When you use the contact form or request a project, we collect the details you provide: your name, email address, phone number, company name and the description of your request, together with any attachment you choose to upload.
            </p>
            <h2>How we use it</h2>
            <p>We use this information only to respond to your enquiry, prepare a proposal and communicate with you about your project. We do not sell or share your information with third parties for marketing.</p>
            <h2>Storage and security</h2>
            <p>Submissions are stored in a secured database that only authorised {SITE.name} administrators can access. Access is role-based and important administrative actions are logged.</p>
            <h2>Cookies</h2>
            <p>The public website does not use tracking cookies. A session cookie is used only for administrators who sign in to the content management dashboard.</p>
            <h2>Your rights</h2>
            <p>
              You can ask us to view, correct or delete the information we hold about you at any time by emailing <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
            </p>
            <h2>Contact</h2>
            <p>
              {SITE.name} · {SITE.email} · {SITE.phone} · {SITE.country}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
