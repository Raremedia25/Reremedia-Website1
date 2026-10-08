"use client";

import { useActionState } from "react";
import { changePasswordAction, type ActionState } from "@/actions/auth";
import { Field, FormAlert, SubmitButton } from "./forms";

export function PasswordForm() {
  const [state, action] = useActionState<ActionState, FormData>(changePasswordAction, {});
  const errors = state.errors ?? {};
  return (
    <form action={action} className="space-y-4">
      <FormAlert state={state} />
      <Field label="Current password" name="currentPassword" required error={errors.currentPassword}>
        <input id="currentPassword" name="currentPassword" type="password" className="input" required autoComplete="current-password" />
      </Field>
      <Field label="New password" name="newPassword" required error={errors.newPassword} hint="At least 8 characters.">
        <input id="newPassword" name="newPassword" type="password" className="input" required minLength={8} autoComplete="new-password" />
      </Field>
      <Field label="Confirm new password" name="confirmPassword" required error={errors.confirmPassword}>
        <input id="confirmPassword" name="confirmPassword" type="password" className="input" required minLength={8} autoComplete="new-password" />
      </Field>
      <SubmitButton pendingText="Updating…">Update password</SubmitButton>
    </form>
  );
}
