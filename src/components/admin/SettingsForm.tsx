"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "@/actions/settings";
import type { ActionState } from "@/lib/actions-shared";
import { SETTING_FIELDS, type SettingsMap } from "@/lib/settings";
import { Field, FormAlert, SubmitButton } from "./forms";

export function SettingsForm({ settings }: { settings: SettingsMap }) {
  const [state, action] = useActionState<ActionState, FormData>(saveSettingsAction, {});
  const errors = state.errors ?? {};
  return (
    <form action={action} className="space-y-4">
      <FormAlert state={state} />
      {SETTING_FIELDS.map((f) => (
        <Field key={f.key} label={f.label} name={f.key} error={errors[f.key]}>
          {f.type === "textarea" ? (
            <textarea id={f.key} name={f.key} className="input min-h-24" defaultValue={settings[f.key] ?? ""} placeholder={f.placeholder} maxLength={1000} />
          ) : (
            <input id={f.key} name={f.key} type={f.type === "url" ? "url" : "text"} className="input" defaultValue={settings[f.key] ?? ""} placeholder={f.placeholder} maxLength={1000} />
          )}
        </Field>
      ))}
      <SubmitButton pendingText="Saving…">Save settings</SubmitButton>
    </form>
  );
}
