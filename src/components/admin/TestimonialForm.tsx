"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveTestimonialAction } from "@/actions/testimonials";
import type { ActionState } from "@/lib/actions-shared";
import type { MediaDTO } from "@/lib/media/dto";
import { Field, FormAlert, SubmitButton, Toggle } from "./forms";
import { FeaturedImageField } from "./media/FeaturedImageField";

export interface TestimonialFormValues {
  id?: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  projectId: string;
  isPublished: boolean;
  order: number;
  photo: MediaDTO | null;
}

export function TestimonialForm({ values, projects }: { values: TestimonialFormValues; projects: Array<{ id: string; title: string }> }) {
  const [state, action] = useActionState<ActionState, FormData>(saveTestimonialAction.bind(null, values.id ?? null), {});
  const errors = state.errors ?? {};
  return (
    <form action={action} className="space-y-4">
      <FormAlert state={state} />
      <Field label="Client name" name="name" required error={errors.name}>
        <input id="name" name="name" className="input" defaultValue={values.name} required maxLength={120} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Role / title" name="role" error={errors.role}>
          <input id="role" name="role" className="input" defaultValue={values.role} maxLength={120} placeholder="e.g. Owner" />
        </Field>
        <Field label="Company / organization" name="company" error={errors.company}>
          <input id="company" name="company" className="input" defaultValue={values.company} maxLength={160} />
        </Field>
      </div>
      <Field label="Quote" name="quote" required error={errors.quote} hint="Use the client's own words, with their permission.">
        <textarea id="quote" name="quote" className="input min-h-32" defaultValue={values.quote} required maxLength={1200} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Rating" name="rating" error={errors.rating}>
          <select id="rating" name="rating" className="input" defaultValue={String(values.rating)}>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {"★".repeat(r)}
                {"☆".repeat(5 - r)} ({r}/5)
              </option>
            ))}
          </select>
        </Field>
        <Field label="Related project" name="projectId" error={errors.projectId}>
          <select id="projectId" name="projectId" className="input" defaultValue={values.projectId}>
            <option value="">None</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <FeaturedImageField name="photoId" initial={values.photo} folder="testimonials" label="Client photo or logo (optional)" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Order" name="order" error={errors.order}>
          <input id="order" name="order" type="number" min={0} className="input" defaultValue={values.order} />
        </Field>
        <Toggle name="isPublished" label="Show on website" defaultChecked={values.isPublished} />
      </div>
      <div className="flex gap-2">
        <SubmitButton className="btn-sm" pendingText="Saving…">
          {values.id ? "Update testimonial" : "Add testimonial"}
        </SubmitButton>
        {values.id && (
          <Link href="/admin/testimonials" className="btn btn-secondary btn-sm">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
