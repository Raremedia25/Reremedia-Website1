"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveCategoryAction } from "@/actions/catalog";
import type { ActionState } from "@/lib/actions-shared";
import { CATEGORY_TYPES } from "@/lib/constants";
import { Field, FormAlert, SubmitButton } from "./forms";

export function CategoryForm({ values }: { values: { id?: string; name: string; slug: string; type: string; description: string; color: string; order: number } }) {
  const [state, action] = useActionState<ActionState, FormData>(saveCategoryAction.bind(null, values.id ?? null), {});
  const errors = state.errors ?? {};
  return (
    <form action={action} className="space-y-4">
      <FormAlert state={state} />
      <Field label="Name" name="name" required error={errors.name}>
        <input id="name" name="name" className="input" defaultValue={values.name} required maxLength={80} />
      </Field>
      <Field label="Type" name="type" error={errors.type}>
        <select id="type" name="type" className="input" defaultValue={values.type}>
          {CATEGORY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "project" ? "Project category" : "Post category"}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Slug" name="slug" error={errors.slug} hint="Leave empty to generate.">
        <input id="slug" name="slug" className="input" defaultValue={values.slug} maxLength={80} />
      </Field>
      <Field label="Description" name="description" error={errors.description}>
        <input id="description" name="description" className="input" defaultValue={values.description} maxLength={300} />
      </Field>
      <Field label="Order" name="order" error={errors.order}>
        <input id="order" name="order" type="number" min={0} className="input" defaultValue={values.order} />
      </Field>
      <div className="flex gap-2">
        <SubmitButton className="btn-sm" pendingText="Saving…">
          {values.id ? "Update category" : "Create category"}
        </SubmitButton>
        {values.id && (
          <Link href="/admin/categories" className="btn btn-secondary btn-sm">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
