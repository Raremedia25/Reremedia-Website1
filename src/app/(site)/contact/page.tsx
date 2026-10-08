import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/site/ContactForm";
import { PageHero } from "@/components/site/PageHero";
import { SITE } from "@/lib/site";
import { whatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: `Talk to Raremedia: ${SITE.email}, ${SITE.phone}. Email, call or WhatsApp us about your website, system or app.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to Raremedia" description="Questions, ideas or a project in mind? Send us a message and we will get back to you quickly." />
      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            <a href={`mailto:${SITE.email}`} className="card card-hover flex items-center gap-4 p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Email</p>
                <p className="font-semibold text-ink-900">{SITE.email}</p>
              </div>
            </a>
            <a href={SITE.phoneHref} className="card card-hover flex items-center gap-4 p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Phone</p>
                <p className="font-semibold text-ink-900">{SITE.phone}</p>
              </div>
            </a>
            <a href={whatsappLink(SITE.phone, "Hello Raremedia, I would like to discuss a project.")} target="_blank" rel="noopener noreferrer" className="card card-hover flex items-center gap-4 p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">WhatsApp</p>
                <p className="font-semibold text-ink-900">Chat with us</p>
              </div>
            </a>
            <div className="card flex items-center gap-4 p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Location</p>
                <p className="font-semibold text-ink-900">
                  {SITE.city}, {SITE.country}
                </p>
              </div>
            </div>
            <div className="rounded-2xl gradient-brand p-6 text-white">
              <h2 className="font-display font-bold">Have a project in mind?</h2>
              <p className="mt-1 text-sm text-white/85">Use the project request form for a structured brief and faster quote.</p>
              <Link href="/request-project" className="btn bg-white text-brand-700 hover:bg-brand-50 btn-sm mt-4">
                Request a Project <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="card p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-ink-900">Send us a message</h2>
            <p className="mt-1 text-sm text-ink-500">We reply within one business day.</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
