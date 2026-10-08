"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Alert, FormField } from "./FormField";

type Errors = Record<string, string>;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    setErrors({});
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.errors ?? {});
        setMessage(json.error ?? "Please check the form and try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      form.reset();
    } catch {
      setMessage("Network error. Please try again or email us directly.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <Alert kind="success" className="p-6 text-base">
        <p className="font-semibold">Thank you! Your message has been received.</p>
        <p className="mt-1">We usually reply within one business day. For urgent matters, call or WhatsApp us.</p>
        <button type="button" onClick={() => setStatus("idle")} className="btn btn-secondary btn-sm mt-4">
          Send another message
        </button>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {status === "error" && message && <Alert kind="error">{message}</Alert>}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" name="name" required error={errors.name}>
          <input id="name" name="name" className="input" required maxLength={120} autoComplete="name" />
        </FormField>
        <FormField label="Email" name="email" required error={errors.email}>
          <input id="email" name="email" type="email" className="input" required maxLength={160} autoComplete="email" />
        </FormField>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Phone" name="phone" error={errors.phone}>
          <input id="phone" name="phone" type="tel" className="input" maxLength={40} autoComplete="tel" placeholder="+250 ..." />
        </FormField>
        <FormField label="Subject" name="subject" required error={errors.subject}>
          <input id="subject" name="subject" className="input" required maxLength={160} />
        </FormField>
      </div>
      <FormField label="Message" name="message" required error={errors.message}>
        <textarea id="message" name="message" className="input min-h-36" required maxLength={5000} />
      </FormField>
      {/* Honeypot: hidden from humans, bots tend to fill it */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={status === "sending"}>
        {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send message
      </button>
    </form>
  );
}
