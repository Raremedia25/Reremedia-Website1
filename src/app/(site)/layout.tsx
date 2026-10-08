import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { getSettings, SETTING_KEYS } from "@/lib/settings";
import { SITE } from "@/lib/site";
import { siteUrl } from "@/lib/utils";

// Every public page reads the CMS database (settings, projects, posts...).
// Render on request instead of at build time so `next build` never needs a
// database: on Netlify, migrations are applied after the build, right before
// the deploy is published.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: siteUrl("/"),
    email: SITE.email,
    telephone: SITE.phone.replace(/\s/g, ""),
    description: settings[SETTING_KEYS.siteDescription] || SITE.description,
    address: { "@type": "PostalAddress", addressLocality: SITE.city, addressCountry: "RW" },
    sameAs: Object.entries(settings)
      .filter(([k, v]) => k.startsWith("social.") && /^https?:\/\//.test(v))
      .map(([, v]) => v),
  };

  return (
    <>
      <Navbar announcement={settings[SETTING_KEYS.announcement] || undefined} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
    </>
  );
}
