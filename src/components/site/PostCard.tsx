import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { toImageSource } from "@/lib/media/image-src";
import { estimateReadingMinutes } from "@/lib/markdown";
import type { PublicPost } from "@/lib/queries/public";
import { POST_TYPE_LABELS, type PostType } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import { ResponsiveImage } from "./ResponsiveImage";

export function PostCard({ post, className, horizontal = false }: { post: PublicPost; className?: string; horizontal?: boolean }) {
  const image = toImageSource(post.featuredImage ?? post.images[0]?.media);
  const label = post.category?.name ?? POST_TYPE_LABELS[post.type as PostType] ?? post.type;
  return (
    <article className={cn("card card-hover group overflow-hidden flex", horizontal ? "flex-col md:flex-row" : "flex-col", className)}>
      <Link href={`/blog/${post.slug}`} className={cn("block", horizontal ? "md:w-5/12 shrink-0" : "")} aria-label={post.title}>
        <ResponsiveImage image={image} className={cn(horizontal ? "aspect-[16/10] md:h-full" : "aspect-[16/10]")} sizes="(min-width: 1024px) 33vw, 100vw" />
      </Link>
      <div className="p-5 md:p-6 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
          <span className="chip bg-brand-50 text-brand-700">{label}</span>
          {post.publishedAt && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(post.publishedAt)}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {estimateReadingMinutes(post.content)} min read
          </span>
        </div>
        <h3 className="font-display mt-3 text-lg font-bold text-ink-900 leading-snug">
          <Link href={`/blog/${post.slug}`} className="hover:text-brand-700 transition-colors">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-ink-500 leading-relaxed line-clamp-3">{post.excerpt}</p>
        <div className="mt-auto pt-5">
          <Link href={`/blog/${post.slug}`} className="text-sm font-semibold text-brand-700">
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );
}
