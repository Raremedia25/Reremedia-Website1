"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye } from "lucide-react";
import { savePostAction } from "@/actions/posts";
import type { ActionState } from "@/lib/actions-shared";
import { POST_TYPE_LABELS, POST_TYPES, PUBLISH_STATUSES } from "@/lib/constants";
import type { MediaDTO } from "@/lib/media/dto";
import { Field, FormAlert, SubmitButton } from "./forms";
import { MarkdownEditor } from "./MarkdownEditor";
import { FeaturedImageField } from "./media/FeaturedImageField";
import { GalleryManager, type GalleryItem } from "./media/GalleryManager";

export interface PostFormValues {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  type: string;
  categoryId: string;
  tags: string;
  publishStatus: string;
  publishedAt: string;
  scheduledAt: string;
  seoTitle: string;
  seoDescription: string;
  featuredImage: MediaDTO | null;
  gallery: GalleryItem[];
}

export function PostForm({ values, categories, created }: { values: PostFormValues; categories: Array<{ id: string; name: string }>; created?: boolean }) {
  const [state, action] = useActionState<ActionState, FormData>(savePostAction.bind(null, values.id ?? null), created ? { success: "Post created. You can keep editing or publish it." } : {});
  const [publishStatus, setPublishStatus] = useState(values.publishStatus);
  const [featured, setFeatured] = useState<MediaDTO | null>(values.featuredImage);
  const errors = state.errors ?? {};

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <FormAlert state={state} />
        <div className="card p-5 md:p-6 space-y-5">
          <Field label="Title" name="title" required error={errors.title}>
            <input id="title" name="title" className="input" defaultValue={values.title} required maxLength={160} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Slug (URL)" name="slug" error={errors.slug} hint="Leave empty to generate from the title.">
              <input id="slug" name="slug" className="input" defaultValue={values.slug} maxLength={120} />
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
          <Field label="Short description" name="excerpt" required error={errors.excerpt} hint="Shown on cards and used as the default SEO description.">
            <textarea id="excerpt" name="excerpt" className="input min-h-24" defaultValue={values.excerpt} required maxLength={400} />
          </Field>
          <MarkdownEditor name="content" defaultValue={values.content} folder="posts" />
        </div>
        <div className="card p-5 md:p-6 space-y-5">
          <h2 className="font-display text-lg font-bold text-ink-900">Images</h2>
          <GalleryManager initial={values.gallery} folder="posts" onSetFeatured={setFeatured} />
        </div>
        <div className="card p-5 md:p-6 space-y-5">
          <h2 className="font-display text-lg font-bold text-ink-900">SEO</h2>
          <Field label="SEO title" name="seoTitle" error={errors.seoTitle}>
            <input id="seoTitle" name="seoTitle" className="input" defaultValue={values.seoTitle} maxLength={160} />
          </Field>
          <Field label="SEO description" name="seoDescription" error={errors.seoDescription}>
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
          {publishStatus === "PUBLISHED" && (
            <Field label="Publication date" name="publishedAt" error={errors.publishedAt} hint="Leave empty to use now.">
              <input id="publishedAt" name="publishedAt" type="datetime-local" className="input" defaultValue={values.publishedAt} />
            </Field>
          )}
          <Field label="Post type" name="type" error={errors.type}>
            <select id="type" name="type" className="input" defaultValue={values.type}>
              {POST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {POST_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tags" name="tags" error={errors.tags} hint="Comma separated, e.g. AI, launch, POS">
            <input id="tags" name="tags" className="input" defaultValue={values.tags} maxLength={400} />
          </Field>
          <div className="flex flex-col gap-2 pt-2">
            <SubmitButton pendingText="Saving…">Save post</SubmitButton>
            {values.id && values.slug && (
              <Link href={`/blog/${values.slug}`} target="_blank" className="btn btn-secondary">
                <Eye className="h-4 w-4" /> Preview page
              </Link>
            )}
          </div>
        </div>
        <div className="card p-5">
          <FeaturedImageField key={featured?.id ?? "none"} initial={featured} folder="posts" />
        </div>
      </aside>
    </form>
  );
}
