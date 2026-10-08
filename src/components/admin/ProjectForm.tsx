"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye } from "lucide-react";
import { saveProjectAction } from "@/actions/projects";
import type { ActionState } from "@/lib/actions-shared";
import { PROJECT_STATUS_LABELS, PROJECT_STATUSES, PUBLISH_STATUSES } from "@/lib/constants";
import type { MediaDTO } from "@/lib/media/dto";
import { Field, FormAlert, SubmitButton, Toggle } from "./forms";
import { MarkdownEditor } from "./MarkdownEditor";
import { FeaturedImageField } from "./media/FeaturedImageField";
import { GalleryManager, type GalleryItem } from "./media/GalleryManager";

export interface ProjectFormValues {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  categoryId: string;
  projectStatus: string;
  publishStatus: string;
  scheduledAt: string;
  clientType: string;
  completedAt: string;
  demoUrl: string;
  githubUrl: string;
  features: string;
  technologies: string;
  isFeatured: boolean;
  order: number;
  seoTitle: string;
  seoDescription: string;
  featuredImage: MediaDTO | null;
  gallery: GalleryItem[];
}

export function ProjectForm({ values, categories, created }: { values: ProjectFormValues; categories: Array<{ id: string; name: string }>; created?: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveProjectAction.bind(null, values.id ?? null), created ? { success: "Project created. You can keep editing or publish it." } : {});
  const [publishStatus, setPublishStatus] = useState(values.publishStatus);
  const [featured, setFeatured] = useState<MediaDTO | null>(values.featuredImage);
  const errors = state.errors ?? {};

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <FormAlert state={state} />
        <div className="card p-5 md:p-6 space-y-5">
          <Field label="Project title" name="title" required error={errors.title}>
            <input id="title" name="title" className="input" defaultValue={values.title} required maxLength={160} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Slug (URL)" name="slug" error={errors.slug} hint="Leave empty to generate from the title.">
              <input id="slug" name="slug" className="input" defaultValue={values.slug} maxLength={120} placeholder="my-project" />
            </Field>
            <Field label="Category" name="categoryId" error={errors.categoryId}>
              <select id="categoryId" name="categoryId" className="input" defaultValue={values.categoryId}>
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Short description" name="summary" required error={errors.summary} hint="Shown on cards and in search results (max 400 characters).">
            <textarea id="summary" name="summary" className="input min-h-24" defaultValue={values.summary} required maxLength={400} />
          </Field>
          <MarkdownEditor name="content" defaultValue={values.content} folder="projects" label="Full description" />
        </div>

        <div className="card p-5 md:p-6 space-y-5">
          <h2 className="font-display text-lg font-bold text-ink-900">Features & technologies</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Features" name="features" error={errors.features} hint="One per line.">
              <textarea id="features" name="features" className="input min-h-40 font-mono text-sm" defaultValue={values.features} />
            </Field>
            <Field label="Technologies" name="technologies" error={errors.technologies} hint="One per line. Only list what was actually used.">
              <textarea id="technologies" name="technologies" className="input min-h-40 font-mono text-sm" defaultValue={values.technologies} />
            </Field>
          </div>
        </div>

        <div className="card p-5 md:p-6 space-y-5">
          <h2 className="font-display text-lg font-bold text-ink-900">Images</h2>
          <GalleryManager initial={values.gallery} folder="projects" onSetFeatured={setFeatured} />
        </div>

        <div className="card p-5 md:p-6 space-y-5">
          <h2 className="font-display text-lg font-bold text-ink-900">SEO</h2>
          <Field label="SEO title" name="seoTitle" error={errors.seoTitle} hint="Defaults to the project title.">
            <input id="seoTitle" name="seoTitle" className="input" defaultValue={values.seoTitle} maxLength={160} />
          </Field>
          <Field label="SEO description" name="seoDescription" error={errors.seoDescription} hint="Defaults to the short description.">
            <textarea id="seoDescription" name="seoDescription" className="input min-h-20" defaultValue={values.seoDescription} maxLength={320} />
          </Field>
        </div>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5 space-y-4">
          <h2 className="font-display text-lg font-bold text-ink-900">Publishing</h2>
          <Field label="Visibility" name="publishStatus" error={errors.publishStatus}>
            <select id="publishStatus" name="publishStatus" className="input" value={publishStatus} onChange={(e) => setPublishStatus(e.target.value)}>
              {PUBLISH_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "DRAFT" ? "Draft (hidden)" : s === "PUBLISHED" ? "Published (visible)" : "Scheduled"}
                </option>
              ))}
            </select>
          </Field>
          {publishStatus === "SCHEDULED" && (
            <Field label="Publish at" name="scheduledAt" required error={errors.scheduledAt}>
              <input id="scheduledAt" name="scheduledAt" type="datetime-local" className="input" defaultValue={values.scheduledAt} />
            </Field>
          )}
          <Field label="Project status" name="projectStatus" error={errors.projectStatus}>
            <select id="projectStatus" name="projectStatus" className="input" defaultValue={values.projectStatus}>
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {PROJECT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Toggle name="isFeatured" label="Feature on homepage" defaultChecked={values.isFeatured} hint="Featured projects are shown first." />
          <Field label="Sort order" name="order" error={errors.order} hint="Lower numbers appear first.">
            <input id="order" name="order" type="number" min={0} className="input" defaultValue={values.order} />
          </Field>
          <div className="flex flex-col gap-2 pt-2">
            <SubmitButton pendingText="Saving…">Save project</SubmitButton>
            {values.id && values.slug && (
              <Link href={`/projects/${values.slug}`} target="_blank" className="btn btn-secondary">
                <Eye className="h-4 w-4" /> Preview page
              </Link>
            )}
            {pending && <p className="text-center text-xs text-ink-500">Saving…</p>}
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <FeaturedImageField key={featured?.id ?? "none"} initial={featured} folder="projects" />
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-display text-lg font-bold text-ink-900">Details</h2>
          <Field label="Client / business type" name="clientType" error={errors.clientType}>
            <input id="clientType" name="clientType" className="input" defaultValue={values.clientType} maxLength={160} placeholder="e.g. Electronics shop" />
          </Field>
          <Field label="Completion date" name="completedAt" error={errors.completedAt}>
            <input id="completedAt" name="completedAt" type="date" className="input" defaultValue={values.completedAt} />
          </Field>
          <Field label="Live demo URL" name="demoUrl" error={errors.demoUrl}>
            <input id="demoUrl" name="demoUrl" type="url" className="input" defaultValue={values.demoUrl} placeholder="https://" />
          </Field>
          <Field label="GitHub URL" name="githubUrl" error={errors.githubUrl}>
            <input id="githubUrl" name="githubUrl" type="url" className="input" defaultValue={values.githubUrl} placeholder="https://github.com/…" />
          </Field>
        </div>
      </aside>
    </form>
  );
}
