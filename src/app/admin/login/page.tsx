import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { Logo } from "@/components/site/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect("/admin");
  const { next } = await searchParams;

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-night-900 px-4 py-12">
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-accent-500/25 blur-3xl" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo light />
        </div>
        <div className="card p-7 md:p-8">
          <h1 className="font-display text-2xl font-bold text-ink-900">Admin dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to manage projects, posts, images and requests.</p>
          <div className="mt-6">
            <LoginForm next={next} />
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-ink-500">Authorised Raremedia administrators only. Activity is logged.</p>
      </div>
    </div>
  );
}
