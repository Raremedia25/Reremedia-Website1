import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";
import { whatsappLink } from "@/lib/utils";

export function CtaBanner({
  title = "Build Your Idea With Us",
  description = "Tell us what your business needs. We will turn it into a reliable, modern digital product with long-term support.",
  primaryLabel = "Start Your Project",
  primaryHref = "/request-project",
}: {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
}) {
  return (
    <section className="container-x pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-night-900 px-6 py-14 md:px-14 md:py-20 text-center">
        <div className="absolute inset-0 bg-grid opacity-70" aria-hidden="true" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-600/40 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight">{title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-ink-300">{description}</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link href={primaryHref} className="btn btn-primary">
              {primaryLabel} <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={whatsappLink(SITE.phone, "Hello Raremedia, I would like to talk about a project.")} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light">
              <MessageCircle className="h-4 w-4" /> Talk to Raremedia on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
