"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveUserAction } from "@/actions/users";
import type { ActionState } from "@/lib/actions-shared";
import { ROLE_LABELS, ROLES } from "@/lib/constants";
import { Field, FormAlert, SubmitButton, Toggle } from "./forms";

export function UserForm({ values }: { values: { id?: string; name: string; email: string; role: string; isActive: boolean } }) {
  const [state, action] = useActionState<ActionState, FormData>(saveUserAction.bind(null, values.id ?? null), {});
  const errors = state.errors ?? {};
  return (
    <form action={action} className="space-y-4" autoComplete="off">
      <FormAlert state={state} />
      <Field label="Full name" name="name" required error={errors.name}>
        <input id="name" name="name" className="input" defaultValue={values.name} required maxLength={120} />
      </Field>
      <Field label="Email" name="email" required error={errors.email}>
        <input id="email" name="email" type="email" className="input" defaultValue={values.email} required maxLength={160} />
      </Field>
      <Field label="Role" name="role" error={errors.role}>
        <select id="role" name="role" className="input" defaultValue={values.role}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </Field>
      <Field label={values.id ? "New password (leave empty to keep)" : "Password"} name="password" required={!values.id} error={errors.password} hint="At least 8 characters.">
        <input id="password" name="password" type="password" className="input" minLength={8} maxLength={200} autoComplete="new-password" />
      </Field>
      <Toggle name="isActive" label="Active" defaultChecked={values.isActive} hint="Inactive users cannot sign in." />
      <div className="flex gap-2">
        <SubmitButton className="btn-sm" pendingText="Saving…">
          {values.id ? "Update user" : "Create user"}
        </SubmitButton>
        {values.id && (
          <Link href="/admin/users" className="btn btn-secondary btn-sm">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
