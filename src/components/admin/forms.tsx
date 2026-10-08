"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SubmitButton({ children, className, variant = "primary", pendingText }: { children: React.ReactNode; className?: string; variant?: "primary" | "secondary" | "danger"; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn("btn", variant === "primary" && "btn-primary", variant === "secondary" && "btn-secondary", variant === "danger" && "btn-danger", className)}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}

/**
 * Delete/confirm button: first click asks for confirmation inline, second
 * click submits the surrounding form (or the provided action).
 */
export function ConfirmButton({ action, label = "Delete", confirmLabel = "Confirm delete", className, small = true, icon = true, hiddenFields }: { action: (formData: FormData) => void | Promise<void>; label?: string; confirmLabel?: string; className?: string; small?: boolean; icon?: boolean; hiddenFields?: Record<string, string> }) {
  const [armed, setArmed] = useState(false);
  return (
    <form action={action} className="inline-flex items-center gap-1.5">
      {hiddenFields && Object.entries(hiddenFields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {armed ? (
        <>
          <SubmitButton variant="danger" className={cn(small && "btn-sm", className)}>
            {confirmLabel}
          </SubmitButton>
          <button type="button" onClick={() => setArmed(false)} className={cn("btn btn-secondary", small && "btn-sm")}>
            Cancel
          </button>
        </>
      ) : (
        <button type="button" onClick={() => setArmed(true)} className={cn("btn btn-secondary text-red-600 hover:border-red-300 hover:bg-red-50", small && "btn-sm", className)}>
          {icon && <Trash2 className="h-4 w-4" />} {label}
        </button>
      )}
    </form>
  );
}

export function Field({ label, name, error, required, hint, children, className }: { label: string; name: string; error?: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label} {required && <span className="text-accent-600">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Toggle({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-200 bg-white p-3">
      <input type="checkbox" name={name} value="true" defaultChecked={defaultChecked} className="mt-0.5 h-4 w-4 accent-brand-600" />
      <span>
        <span className="block text-sm font-semibold text-ink-900">{label}</span>
        {hint && <span className="block text-xs text-ink-500">{hint}</span>}
      </span>
    </label>
  );
}

export function FormAlert({ state }: { state: { error?: string; success?: string } }) {
  if (state.error)
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {state.error}
      </div>
    );
  if (state.success)
    return (
      <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        {state.success}
      </div>
    );
  return null;
}
