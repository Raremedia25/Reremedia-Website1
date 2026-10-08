import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, CheckCircle2, ExternalLink, Tag, User } from "lucide-react";
import { GithubIcon } from "@/components/site/SocialIcon";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { ProjectCard } from "@/components/site/ProjectCard";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { ShareButtons } from "@/components/site/ShareButtons";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/constants";
import { parseList } from "@/lib/json";
import { renderMarkdown } from "@/lib/markdown";
import { toImageSource, variantUrl } from "@/lib/media/image-src";
import { getProjectBySlug, getRelatedProjects, incrementProjectViews } from "@/lib/queries/public";
import { cn, formatDate, siteUrl } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  const title = project.seoTitle || project.title;
  const description = project.seoDescription || project.summary;
  const image = variantUrl(project.featuredImage ?? project.images[0]?.media, 1200);
  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title, description, type: "article", url: siteUrl(`/projects/${project.slug}`), images: image ? [{ url: image }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  await incrementProjectViews(project.id);
  const related = await getRelatedProjects(project);

  const featured = toImageSource(project.featuredImage ?? project.images[0]?.media);
  const gallery = project.images
    .map((pi) => ({ image: toImageSource(pi.media)!, caption: pi.caption, title: project.title }))
    .filter((g) => g.image);
  const features = parseList(project.features);
  const technologies = parseList(project.technologies);
  const status = PROJECT_STATUS_LABELS[project.projectStatus as ProjectStatus] ?? project.projectStatus;
  const html = renderMarkdown(project.content);
  const url = siteUrl(`/projects/${project.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.summary,
    url,
    image: variantUrl(project.featuredImage, 1200) ?? undefined,
    applicationCategory: project.category?.name,
    author: { "@type": "Organization", name: "Raremedia" },
    datePublished: project.publishedAt?.toISOString(),
  };

  return (
    <>
      <section className="relative overflow-hidden bg-night-900 text-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
        <div className="absolute -top-32 right-1/4 h-80 w-80 rounded-full bg-brand-600/40 blur-3xl" aria-hidden="true" />
        <div className="container-x relative py-12 md:py-16">
          <nav className="text-sm text-ink-300" aria-label="Breadcrumb">
            <Link href="/projects" className="hover:text-white">
              Projects
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{project.title}</span>
          </nav>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="animate-fade-up">
              <div className="flex flex-wrap items-center gap-2">
                {project.category && <span className="chip glass text-brand-200">{project.category.name}</span>}
                <span className={cn("chip", project.projectStatus === "COMPLETED" ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-200")}>{status}</span>
              </div>
              <h1 className="font-display mt-4 text-3xl md:text-5xl font-bold tracking-tight leading-[1.1]">{project.title}</h1>
              <p className="mt-5 text-lg text-ink-300 leading-relaxed">{project.summary}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/request-project?similar=${encodeURIComponent(project.title)}`} className="btn btn-primary">
                  Request a Similar System <ArrowRight className="h-4 w-4" />
                </Link>
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light">
                    <ExternalLink className="h-4 w-4" /> Live demo
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light">
                    <GithubIcon className="h-4 w-4" /> GitHub
                  </a>
                )}
              </div>
            </div>
            <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
              <ResponsiveImage image={featured} className="aspect-[16/10] rounded-2xl border border-white/10 shadow-2xl" sizes="(min-width: 1024px) 50vw, 100vw" priority />
              {featured?.isDemo && <p className="mt-2 text-xs text-amber-300">Demo image — representative visual, not a product screenshot.</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            {html ? <div className="prose-rr" dangerouslySetInnerHTML={{ __html: html }} /> : null}

            {features.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-bold text-ink-900">Key features</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 rounded-xl border border-ink-200 bg-white p-3.5 text-sm text-ink-700">
                      <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-600" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {gallery.length > 0 && (
              <div className="mt-12">
                <h2 className="font-display text-2xl font-bold text-ink-900">Gallery</h2>
                <p className="mt-1 text-sm text-ink-500">Click any image to open it full-screen.</p>
                <GalleryGrid items={gallery} columns={2} className="mt-5" />
              </div>
            )}

            <div className="mt-12 border-t border-ink-200 pt-6">
              <ShareButtons url={url} title={project.title} />
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <h3 className="font-display font-bold text-ink-900">Project details</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Tag className="mt-0.5 h-4 w-4 text-brand-600" />
                  <div>
                    <dt className="text-ink-500">Status</dt>
                    <dd className="font-medium text-ink-900">{status}</dd>
                  </div>
                </div>
                {project.clientType && (
                  <div className="flex items-start gap-3">
                    <User className="mt-0.5 h-4 w-4 text-brand-600" />
                    <div>
                      <dt className="text-ink-500">Client / business type</dt>
                      <dd className="font-medium text-ink-900">{project.clientType}</dd>
                    </div>
                  </div>
                )}
                {project.completedAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-4 w-4 text-brand-600" />
                    <div>
                      <dt className="text-ink-500">Completed</dt>
                      <dd className="font-medium text-ink-900">{formatDate(project.completedAt, { month: "long" })}</dd>
                    </div>
                  </div>
                )}
              </dl>
              {technologies.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm text-ink-500">Technologies</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {technologies.map((t) => (
                      <li key={t} className="chip">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="rounded-2xl gradient-brand p-6 text-white">
              <h3 className="font-display font-bold">Need something similar?</h3>
              <p className="mt-2 text-sm text-white/85">We can adapt this system to your business or build a new one from scratch.</p>
              <Link href={`/request-project?similar=${encodeURIComponent(project.title)}`} className="btn bg-white text-brand-700 hover:bg-brand-50 btn-sm mt-4 w-full">
                Request a Similar System
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="pb-20">
          <div className="container-x">
            <h2 className="font-display text-2xl font-bold text-ink-900">Related projects</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProjectCard key={p.id} project={p} className="h-full" />
              ))}
            </div>
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
