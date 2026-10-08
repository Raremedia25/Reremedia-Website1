import { revalidatePath } from "next/cache";
import { AuthError } from "@/lib/auth/current-user";

export interface ActionState {
  error?: string;
  errors?: Record<string, string>;
  success?: string;
  id?: string;
}

/** Convert thrown errors into an ActionState (never leak stack traces). */
export function actionError(err: unknown): ActionState {
  if (err instanceof AuthError) return { error: err.message };
  if (err instanceof Error && err.message.startsWith("Could not")) return { error: err.message };
  console.error("[action]", err);
  return { error: "Something went wrong. Please try again." };
}

/** Revalidate every public page that can show content of a given kind. */
export function revalidatePublic(kind: "projects" | "posts" | "services" | "settings" | "all") {
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  if (kind === "projects" || kind === "all") {
    revalidatePath("/projects", "layout");
    revalidatePath("/portfolio");
    revalidatePath("/solutions");
    revalidatePath("/search");
  }
  if (kind === "posts" || kind === "all") {
    revalidatePath("/blog", "layout");
    revalidatePath("/search");
  }
  if (kind === "services" || kind === "all") {
    revalidatePath("/services");
    revalidatePath("/search");
  }
  if (kind === "settings" || kind === "all") {
    revalidatePath("/", "layout");
  }
}
