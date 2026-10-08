"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Paperclip, Send } from "lucide-react";
import { BUDGET_RANGES, PROJECT_TYPES } from "@/lib/constants";
import { Alert, FormField } from "./FormField";

type Errors = Record<string, string>;

export function RequestProjectForm({ defaultType, defaultDescription }: { defaultType?: string; defaultDescription?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [reference, setReference] = useState("");

  const initialType = (PROJECT_TYPES as readonly string[]).includes(defaultType ?? "") ? defaultType : "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const body = new FormData(form);
    setStatus("sending");
    setErrors({});
    try {
      const res = await fetch("/api/project-requests", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.errors ?? {});
        setMessage(json.error ?? "Please check the form and try again.");
        setStatus("error");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setReference(json.reference ?? "");
      setStatus("sent");
      form.reset();
      setFileName("");
    } catch {
      setMessage("Network error. Please try again or contact us directly.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="card p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="font-display mt-4 text-2xl font-bold text-ink-900">Request received</h2>
        <p className="mt-2 text-ink-500">
          Thank you. We have your project request{reference ? ` (reference ${reference})` : ""} and will contact you shortly to discuss it.
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="btn btn-secondary btn-sm mt-6">
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 md:p-8 space-y-6" noValidate encType="multipart/form-data">
      {status === "error" && message && <Alert kind="error">{message}</Alert>}

      <fieldset className="space-y-5">
        <legend className="font-display text-lg font-bold text-ink-900">About you</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Full name" name="fullName" required error={errors.fullName}>
            <input id="fullName" name="fullName" className="input" required maxLength={120} autoComplete="name" />
          </FormField>
          <FormField label="Company / organization" name="company" error={errors.company}>
            <input id="company" name="company" className="input" maxLength={160} autoComplete="organization" />
          </FormField>
          <FormField label="Email" name="email" required error={errors.email}>
            <input id="email" name="email" type="email" className="input" required maxLength={160} autoComplete="email" />
          </FormField>
          <FormField label="Phone" name="phone" required error={errors.phone}>
            <input id="phone" name="phone" type="tel" className="input" required maxLength={40} autoComplete="tel" placeholder="+250 ..." />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-display text-lg font-bold text-ink-900">About the project</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Project type" name="projectType" required error={errors.projectType}>
            <select id="projectType" name="projectType" className="input" required defaultValue={initialType}>
              <option value="" disabled>
                Select a type
              </option>
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Budget range" name="budgetRange" error={errors.budgetRange} hint="An estimate helps us propose the right scope.">
            <select id="budgetRange" name="budgetRange" className="input" defaultValue="">
              <option value="">Prefer not to say</option>
              {BUDGET_RANGES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Project description" name="description" required error={errors.description} hint="What should the system do? Who will use it? What problem does it solve?">
          <textarea id="description" name="description" className="input min-h-36" required maxLength={6000} defaultValue={defaultDescription} />
        </FormField>
        <FormField label="Required features" name="features" error={errors.features} hint="One per line, e.g. stock management, receipts, reports, offline mode.">
          <textarea id="features" name="features" className="input min-h-28" maxLength={4000} />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Preferred deadline" name="deadline" error={errors.deadline}>
            <input id="deadline" name="deadline" className="input" maxLength={120} placeholder="e.g. within 2 months" />
          </FormField>
          <FormField label="Reference links" name="referenceLinks" error={errors.referenceLinks} hint="Websites or systems you like.">
            <input id="referenceLinks" name="referenceLinks" className="input" maxLength={2000} placeholder="https://..." />
          </FormField>
        </div>
        <FormField label="Attachment" name="attachment" error={errors.attachment} hint="Optional. JPG, PNG, WebP or PDF up to 10 MB (sketches, documents, screenshots).">
          <label className="input flex cursor-pointer items-center gap-3 text-ink-500">
            <Paperclip className="h-4 w-4" />
            <span className="truncate">{fileName || "Choose a file…"}</span>
            <input id="attachment" name="attachment" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
          </label>
        </FormField>
      </fieldset>

      <div className="hidden" aria-hidden="true">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-500">By submitting you agree that we may contact you about this request.</p>
        <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
          {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit project request
        </button>
      </div>
    </form>
  );
}
