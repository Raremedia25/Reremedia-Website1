"use client";

import { useActionState } from "react";
import { saveServiceAction } from "@/actions/catalog";
import type { ActionState } from "@/lib/actions-shared";
import { SERVICE_ICON_KEYS, ServiceIcon } from "@/components/site/ServiceIcon";
import { Field, FormAlert, SubmitButton, Toggle } from "./forms";
import { MarkdownEditor } from "./MarkdownEditor";

export interface ServiceFormValues {
  id?: string;
  name: string;
  slug: string;
  icon: string;
  summary: string;
  description: string;
  items: string;
  order: number;
  isPublished: boolean;
}

export function ServiceForm({ values, created }: { values: ServiceFormValues; created?: boolean }) {
  const [state, action] = useActionState<ActionState, FormData>(saveServiceAction.bind(null, values.id ?? null), created ? { success: "Service created." } : {});
  const errors = state.errors ?? {};
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <FormAlert state={state} />
        <div className="card p-5 md:p-6 space-y-5">
          <Field label="Service name" name="name" required error={errors.name}>
            <input id="name" name="name" className="input" defaultValue={values.name} required maxLength={120} />
          </Field>
          <Field label="Slug" name="slug" error={errors.slug} hint="Used for anchors and links. Leave empty to generate.">
            <input id="slug" name="slug" className="input" defaultValue={values.slug} maxLength={120} />
          </Field>
          <Field label="Summary" name="summary" required error={errors.summary}>
            <textarea id="summary" name="summary" className="input min-h-24" defaultValue={values.summary} required maxLength={300} />
          </Field>
          <Field label="Offerings" name="items" error={errors.items} hint="One per line. Shown as a checklist on the card.">
            <textarea id="items" name="items" className="input min-h-44 font-mono text-sm" defaultValue={values.items} />
          </Field>
          <MarkdownEditor name="description" defaultValue={values.description} label="Longer description (optional)" rows={8} />
        </div>
      </div>
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5 space-y-4">
          <Field label="Icon" name="icon" error={errors.icon}>
            <select id="icon" name="icon" className="input" defaultValue={values.icon}>
              {SERVICE_ICON_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex flex-wrap gap-2">
            {SERVICE_ICON_KEYS.map((k) => (
              <span key={k} className="grid h-8 w-8 place-items-center rounded-lg bg-ink-100 text-ink-700" title={k}>
                <ServiceIcon name={k} className="h-4 w-4" />
              </span>
            ))}
          </div>
          <Field label="Sort order" name="order" error={errors.order}>
            <input id="order" name="order" type="number" min={0} className="input" defaultValue={values.order} />
          </Field>
          <Toggle name="isPublished" label="Visible on website" defaultChecked={values.isPublished} />
          <SubmitButton className="w-full" pendingText="Saving…">
            Save service
          </SubmitButton>
        </div>
      </aside>
    </form>
  );
}
