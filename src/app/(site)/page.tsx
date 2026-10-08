import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Headset, Layers } from "lucide-react";
import { ClientJourney } from "@/components/site/ClientJourney";
import { CtaBanner } from "@/components/site/CtaBanner";
import { HeroVisual } from "@/components/site/HeroVisual";
import { JourneyStrip } from "@/components/site/JourneyStrip";
import { PostCard } from "@/components/site/PostCard";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServiceCard } from "@/components/site/ServiceCard";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { TechMarquee } from "@/components/site/TechMarquee";
import { Testimonials } from "@/components/site/Testimonials";
import { PROCESS, SOLUTIONS } from "@/lib/content/solutions";
import { getJourneyImages, getPublishedPosts, getPublishedProjects, getPublishedServices, getPublishedTestimonials } from "@/lib/queries/public";

export default async function HomePage() {
  const [projects, services, posts, journey, testimonials] = await Promise.all([
    getPublishedProjects({ limit: 6, featuredFirst: true }),
    getPublishedServices(),
    getPublishedPosts({ limit: 3 }),
    getJourneyImages(),
    getPublishedTestimonials(6),
  ]);

  return (
    <>
      {/* ------------------------------------------------------------ Hero */}
      <section className="relative overflow-hidden bg-night-900 text-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
        <div className="absolute -top-40 -left-32 h-[32rem] w-[32rem] rounded-full bg-brand-600/40 blur-3xl animate-pulse-soft" aria-hidden="true" />
        <div className="absolute -bottom-48 right-0 h-[28rem] w-[28rem] rounded-full bg-accent-500/25 blur-3xl animate-pulse-soft" aria-hidden="true" />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />

        <div className="container-x relative grid gap-14 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-28">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-semibold text-brand-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Software development & digital technology · Rwanda
            </span>
            <h1 className="font-display mt-6 text-4xl font-extrabold tracking-tight leading-[1.08] sm:text-5xl lg:text-6xl">
              We Build Digital Solutions That <span className="gradient-text">Move Businesses Forward.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
              From professional websites to powerful business systems, advanced platforms and AI-powered solutions, Raremedia turns ideas into reliable digital products.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/request-project" className="btn btn-primary">
                Start Your Project <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/projects" className="btn btn-ghost-light">
                Explore Our Projects
              </Link>
            </div>
            <JourneyStrip light className="mt-10 justify-start" />
          </div>
          <div className="relative px-4 sm:px-8 lg:px-0 pt-6 pb-10">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- Trust strip */}
      <section className="border-b border-ink-100 bg-white">
        <div className="container-x grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {[
            { icon: Layers, title: "Custom-built", text: "Designed around your workflow" },
            { icon: ShieldCheck, title: "Secure by design", text: "Roles, validation, audit logs" },
            { icon: Zap, title: "Fast & responsive", text: "Mobile-first, optimised assets" },
            { icon: Headset, title: "Long-term support", text: "We stay after launch" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-ink-900 text-sm">{item.title}</p>
                <p className="text-xs text-ink-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ Services */}
      <section className="section bg-ink-50">
        <div className="container-x">
          <Reveal>
            <SectionHeading eyebrow="Services" title="Everything your business needs to go digital" description="Websites, management systems, POS, booking platforms, AI applications and fully custom software, built and supported by one team." />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service, i) => (
              <Reveal key={service.id} delay={i * 60}>
                <ServiceCard service={service} compact className="h-full" />
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/services" className="btn btn-secondary">
              Explore Our Services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- Solutions */}
      <section className="section">
        <div className="container-x">
          <Reveal>
            <SectionHeading eyebrow="Solutions" title="Solutions for Every Business" description="Industry-ready systems for businesses, hotels, cooperatives, schools, farms, organizations and startups." />
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SOLUTIONS.map((s, i) => (
              <Reveal key={s.id} delay={i * 50}>
                <Link href={`/solutions#${s.id}`} className="card card-hover block p-5 h-full">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <ServiceIcon name={s.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-4 font-bold text-ink-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-500 line-clamp-2">{s.items.join(", ")}.</p>
                </Link>
              </Reveal>
            ))}
            <Reveal delay={350}>
              <Link href="/request-project" className="block h-full rounded-2xl gradient-brand p-5 text-white card-hover">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
                  <ArrowRight className="h-5 w-5" />
                </span>
                <h3 className="font-display mt-4 font-bold">Something else?</h3>
                <p className="mt-1.5 text-sm text-white/85">Tell us your idea and we will design a custom system for it.</p>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Projects */}
      <section className="section bg-night-900 text-white">
        <div className="container-x">
          <Reveal>
            <SectionHeading light eyebrow="Portfolio" title="What Raremedia has built" description="Real systems running in real businesses: cooperatives, shops, bars, hotels and more." />
          </Reveal>
          {projects.length === 0 ? (
            <p className="mt-12 text-center text-ink-300">Projects will appear here once they are published from the admin dashboard.</p>
          ) : (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, i) => (
                <Reveal key={project.id} delay={i * 60}>
                  <ProjectCard project={project} className="h-full" priority={i < 3} />
                </Reveal>
              ))}
            </div>
          )}
          <div className="mt-10 text-center">
            <Link href="/projects" className="btn btn-ghost-light">
              View Our Projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------- Client journey */}
      <ClientJourney images={journey} />

      {/* ------------------------------------------------------- Process */}
      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <Reveal>
            <SectionHeading align="left" eyebrow="How we work" title="A clear process from idea to launch" description="You always know what is happening, what comes next and what it costs." />
            <ul className="mt-8 space-y-3 text-sm text-ink-700">
              {["Transparent scope and pricing", "Regular previews during development", "Training for your team", "Updates and support after launch"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-brand-600" /> {t}
                </li>
              ))}
            </ul>
            <Link href="/request-project" className="btn btn-primary mt-8">
              Get a Custom System <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {PROCESS.map((p, i) => (
              <Reveal key={p.step} delay={i * 80}>
                <div className="card p-6 h-full">
                  <span className="font-display text-3xl font-extrabold gradient-text">{p.step}</span>
                  <h3 className="font-display mt-3 font-bold text-ink-900">{p.title}</h3>
                  <p className="mt-2 text-sm text-ink-500 leading-relaxed">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------- Testimonials */}
      <Testimonials items={testimonials} />

      {/* -------------------------------------------------- Technologies */}
      <section className="py-14 bg-ink-50 border-y border-ink-100">
        <div className="container-x">
          <Reveal>
            <SectionHeading eyebrow="Technologies" title="Modern tools we work with" />
          </Reveal>
          <div className="mt-8">
            <TechMarquee />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Blog */}
      {posts.items.length > 0 && (
        <section className="section">
          <div className="container-x">
            <Reveal>
              <SectionHeading eyebrow="Updates" title="Latest from Raremedia" />
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {posts.items.map((post, i) => (
                <Reveal key={post.id} delay={i * 60}>
                  <PostCard post={post} className="h-full" />
                </Reveal>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/blog" className="btn btn-secondary">
                All updates <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <CtaBanner />
    </>
  );
}
