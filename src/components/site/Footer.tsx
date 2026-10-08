import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FOOTER_SERVICES, NAV_LINKS, SITE } from "@/lib/site";
import { SETTING_KEYS, socialLinks, type SettingsMap } from "@/lib/settings";
import { SocialIcon } from "./SocialIcon";
import { Logo } from "./Logo";

export function Footer({ settings }: { settings: SettingsMap }) {
  const socials = socialLinks(settings);
  const tagline = settings[SETTING_KEYS.siteTagline] || "Digital solutions built for modern businesses.";
  const note = settings[SETTING_KEYS.footerNote];
  const year = new Date().getFullYear();

  return (
    <footer className="bg-night-950 text-ink-300 mt-auto">
      <div className="container-x py-14 md:py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-300">{tagline}</p>
          <p className="mt-4 text-xs font-semibold tracking-wide text-brand-300">{SITE.tagline}</p>
          {socials.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/5 border border-white/10 text-ink-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <SocialIcon id={s.id} className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">Navigation</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_LINKS.filter((l) => l.href !== "/portfolio").map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {FOOTER_SERVICES.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2.5 hover:text-white transition-colors">
                <Mail className="h-4 w-4 text-brand-300" /> {SITE.email}
              </a>
            </li>
            <li>
              <a href={SITE.phoneHref} className="inline-flex items-center gap-2.5 hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-brand-300" /> {SITE.phone}
              </a>
            </li>
            <li className="inline-flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-brand-300" /> {SITE.country}
            </li>
          </ul>
          <Link href="/request-project" className="btn btn-primary btn-sm mt-6">
            Request a Project
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-500">
          <p>
            © {year} {SITE.name}. All rights reserved.{note ? ` ${note}` : ""}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/admin/login" className="hover:text-white">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
