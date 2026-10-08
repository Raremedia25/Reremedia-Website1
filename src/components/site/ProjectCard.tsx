import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { parseList } from "@/lib/json";
import { toImageSource } from "@/lib/media/image-src";
import type { PublicProject } from "@/lib/queries/public";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ResponsiveImage } from "./ResponsiveImage";

export function ProjectCard({ project, priority = false, className }: { project: PublicProject; priority?: boolean; className?: string }) {
  const image = toImageSource(project.featuredImage ?? project.images[0]?.media);
  const tech = parseList(project.technologies).slice(0, 4);
  const status = PROJECT_STATUS_LABELS[project.projectStatus as ProjectStatus] ?? project.projectStatus;

  return (
    <article className={cn("card card-hover group overflow-hidden flex flex-col", className)}>
      <Link href={`/projects/${project.slug}`} className="block" aria-label={project.title}>
        <ResponsiveImage image={image} className="aspect-[16/10]" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" priority={priority} />
      </Link>
      <div className="p-5 md:p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 text-xs">
          {project.category ? <span className="chip bg-brand-50 text-brand-700">{project.category.name}</span> : <span />}
          <span className={cn("chip", project.projectStatus === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{status}</span>
        </div>
        <h3 className="font-display mt-3 text-lg font-bold text-ink-900 leading-snug">
          <Link href={`/projects/${project.slug}`} className="hover:text-brand-700 transition-colors">
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-ink-500 leading-relaxed line-clamp-3">{project.summary}</p>
        {tech.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
            {tech.map((t) => (
              <li key={t} className="chip bg-ink-100 text-ink-700 font-medium">
                {t}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto pt-5">
          <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 group-hover:gap-2 transition-all">
            View project <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
