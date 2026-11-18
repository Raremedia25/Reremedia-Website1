import { resolveDemo } from "@/components/demos/registry";
import { getDemoShots } from "@/components/demos/screens";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/constants";
import { parseList } from "@/lib/json";
import { toImageSource, type ImageSource } from "@/lib/media/image-src";
import type { PublicProject } from "@/lib/queries/public";

/** Serialisable project data for the public showcase (cards + client-side filters). */
export interface ShowcaseProject {
  id: string;
  slug: string;
  title: string;
  summary: string;
  categoryName: string | null;
  categorySlug: string | null;
  status: string;
  completed: boolean;
  technologies: string[];
  /** Lower-cased text the search box matches against. */
  haystack: string;
  /** Interface shown on the laptop (real screenshot or a screen of the interactive demo). */
  desktop: ImageSource | null;
  /** Phone view of the same system, when there is one. */
  mobile: ImageSource | null;
  /** Cover used when the project has no interface image. */
  cover: ImageSource | null;
  accent: string;
  demo: { key: string; title: string } | null;
}

/**
 * Pick the picture that best shows the system's interface:
 * a screenshot uploaded from the admin, else the interactive demo's screens.
 */
export function toShowcaseProject(project: PublicProject): ShowcaseProject {
  const demo = resolveDemo(project);
  const shots = demo ? getDemoShots(demo.key) : [];
  const uploaded = project.images.find((pi) => pi.kind === "SCREENSHOT")?.media;
  const demoDesktop = shots.find((s) => !s.mobile && s.label !== "Sign-in")?.image ?? null;
  const desktop = toImageSource(uploaded) ?? demoDesktop;
  const mobile = shots.find((s) => s.mobile)?.image ?? null;
  const technologies = parseList(project.technologies);
  const features = parseList(project.features);
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    summary: project.summary ?? "",
    categoryName: project.category?.name ?? null,
    categorySlug: project.category?.slug ?? null,
    status: PROJECT_STATUS_LABELS[project.projectStatus as ProjectStatus] ?? project.projectStatus,
    completed: project.projectStatus === "COMPLETED",
    technologies,
    haystack: [project.title, project.summary, project.category?.name, project.clientType, ...technologies, ...features].filter(Boolean).join(" ").toLowerCase(),
    desktop,
    mobile,
    cover: toImageSource(project.featuredImage ?? project.images[0]?.media),
    accent: demo?.accent ?? "#6d28d9",
    demo: demo ? { key: demo.key, title: demo.title } : null,
  };
}
