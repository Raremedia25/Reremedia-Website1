import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Target, Telescope } from "lucide-react";
import { CtaBanner } from "@/components/site/CtaBanner";
import { JourneyStrip } from "@/components/site/JourneyStrip";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { TechMarquee } from "@/components/site/TechMarquee";
import { Testimonials } from "@/components/site/Testimonials";
import { getPublishedTestimonials } from "@/lib/queries/public";
import { PROCESS, VALUES } from "@/lib/content/solutions";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Raremedia",
  description: "Raremedia builds practical digital solutions that solve real business problems: custom development, modern technology, scalable architecture, security, performance and long-term support.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const testimonials = await getPublishedTestimonials(6);
  return (
    <>
      <PageHero eyebrow="About" title="Practical digital solutions for real business problems" description={`${SITE.name} is a software development and digital technology company based in ${SITE.country}. We help businesses and organizations replace manual processes with modern, reliable systems and support them for the long term.`}>
        <JourneyStrip light className="justify-start" />
      </PageHero>

      <section className="section">
        <div className="container-x grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="card h-full p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <Target className="h-6 w-6" />
              </span>
              <h2 className="font-display mt-5 text-2xl font-bold text-ink-900">Our Mission</h2>
              <p className="mt-3 text-ink-500 leading-relaxed">To help businesses and organizations transform ideas and manual processes into modern digital systems.</p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="card h-full p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-500/10 text-accent-600">
                <Telescope className="h-6 w-6" />
              </span>
              <h2 className="font-display mt-5 text-2xl font-bold text-ink-900">Our Vision</h2>
              <p className="mt-3 text-ink-500 leading-relaxed">To become a trusted technology partner for businesses and organizations in Rwanda and beyond.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section bg-ink-50">
        <div className="container-x">
          <Reveal>
            <SectionHeading eyebrow="What we stand for" title="Why businesses work with Raremedia" />
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 40}>
                <div className="card h-full p-6">
                  <h3 className="font-display font-bold text-ink-900">{v.title}</h3>
                  <p className="mt-2 text-sm text-ink-500 leading-relaxed">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <Reveal>
            <SectionHeading eyebrow="Process" title="How a project with us works" />
          </Reveal>
          <ol className="mt-12 grid gap-4 md:grid-cols-4">
            {PROCESS.map((p, i) => (
              <Reveal key={p.step} as="li" delay={i * 70}>
                <div className="card h-full p-6">
                  <span className="font-display text-3xl font-extrabold gradient-text">{p.step}</span>
                  <h3 className="font-display mt-3 font-bold text-ink-900">{p.title}</h3>
                  <p className="mt-2 text-sm text-ink-500 leading-relaxed">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <Testimonials items={testimonials} />

      <section className="py-14 bg-ink-50 border-y border-ink-100">
        <div className="container-x">
          <SectionHeading eyebrow="Technologies" title="Tools we build with" description="We choose the right technology for each project and only claim what we actually use." />
          <div className="mt-8">
            <TechMarquee />
          </div>
          <div className="mt-8 text-center">
            <Link href="/projects" className="btn btn-secondary">
              See our projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="pt-20">
        <CtaBanner title="Talk to Raremedia" description="Have a question or an idea? We reply quickly and explain things in plain language." primaryLabel="Contact us" primaryHref="/contact" />
      </div>
    </>
  );
}
