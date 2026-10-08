"use client";

import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { loginAction, type ActionState } from "@/actions/auth";
import { Alert, FormField } from "@/components/site/FormField";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-5">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {next && <input type="hidden" name="next" value={next} />}
      <FormField label="Email" name="email" required error={state.errors?.email}>
        <input id="email" name="email" type="email" className="input" required autoComplete="email" autoFocus defaultValue={state.email ?? ""} />
      </FormField>
      <FormField label="Password" name="password" required error={state.errors?.password}>
        <input id="password" name="password" type="password" className="input" required autoComplete="current-password" minLength={8} />
      </FormField>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Sign in
      </button>
    </form>
  );
}
