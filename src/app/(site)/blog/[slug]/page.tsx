import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, User } from "lucide-react";
import { CtaBanner } from "@/components/site/CtaBanner";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { PostCard } from "@/components/site/PostCard";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { ShareButtons } from "@/components/site/ShareButtons";
import { POST_TYPE_LABELS, type PostType } from "@/lib/constants";
import { parseList } from "@/lib/json";
import { estimateReadingMinutes, renderMarkdown } from "@/lib/markdown";
import { toImageSource, variantUrl } from "@/lib/media/image-src";
import { getPostBySlug, getPublishedPosts, incrementPostViews } from "@/lib/queries/public";
import { formatDate, siteUrl } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const image = variantUrl(post.featuredImage ?? post.images[0]?.media, 1200);
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title, description, type: "article", url: siteUrl(`/blog/${post.slug}`), publishedTime: post.publishedAt?.toISOString(), images: image ? [{ url: image }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  await incrementPostViews(post.id);
  const more = (await getPublishedPosts({ limit: 4 })).items.filter((p) => p.id !== post.id).slice(0, 3);

  const featured = toImageSource(post.featuredImage ?? post.images[0]?.media);
  const gallery = post.images.map((pi) => ({ image: toImageSource(pi.media)!, caption: pi.caption, title: post.title })).filter((g) => g.image);
  const tags = parseList(post.tags);
  const html = renderMarkdown(post.content);
  const url = siteUrl(`/blog/${post.slug}`);
  const label = post.category?.name ?? POST_TYPE_LABELS[post.type as PostType] ?? post.type;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url,
    image: variantUrl(post.featuredImage, 1200) ?? undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.author?.name ?? "Raremedia" },
    publisher: { "@type": "Organization", name: "Raremedia" },
  };

  return (
    <>
      <article>
        <header className="relative overflow-hidden bg-night-900 text-white">
          <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
          <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-brand-600/40 blur-3xl" aria-hidden="true" />
          <div className="container-x relative py-12 md:py-16 max-w-4xl">
            <nav className="text-sm text-ink-300" aria-label="Breadcrumb">
              <Link href="/blog" className="hover:text-white">
                Blog
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">{label}</span>
            </nav>
            <h1 className="font-display mt-5 text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] animate-fade-up">{post.title}</h1>
            <p className="mt-5 text-lg text-ink-300 leading-relaxed">{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-300">
              {post.author && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" /> {post.author.name}
                </span>
              )}
              {post.publishedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {formatDate(post.publishedAt, { month: "long" })}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {estimateReadingMinutes(post.content)} min read
              </span>
            </div>
          </div>
        </header>

        <div className="container-x max-w-4xl">
          {featured && (
            <div className="-mt-6 md:-mt-10 relative">
              <ResponsiveImage image={featured} className="aspect-[16/9] rounded-2xl border border-ink-200 shadow-lift" sizes="(min-width: 1024px) 896px, 100vw" priority />
              {featured.caption && <p className="mt-2 text-center text-xs text-ink-500">{featured.caption}</p>}
            </div>
          )}
          <div className="py-12">
            {html ? <div className="prose-rr" dangerouslySetInnerHTML={{ __html: html }} /> : <p className="text-ink-500">This article has no content yet.</p>}
            {gallery.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-xl font-bold text-ink-900">Gallery</h2>
                <GalleryGrid items={gallery} columns={2} className="mt-4" />
              </div>
            )}
            {tags.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
                {tags.map((t) => (
                  <li key={t}>
                    <Link href={`/blog?q=${encodeURIComponent(t)}`} className="chip hover:bg-brand-50 hover:text-brand-700">
                      #{t}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8 border-t border-ink-200 pt-6">
              <ShareButtons url={url} title={post.title} />
            </div>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="pb-20">
          <div className="container-x">
            <h2 className="font-display text-2xl font-bold text-ink-900">More from Raremedia</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {more.map((p) => (
                <PostCard key={p.id} post={p} className="h-full" />
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBanner />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
