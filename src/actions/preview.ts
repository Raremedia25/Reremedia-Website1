"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { renderMarkdown } from "@/lib/markdown";

/** Render Markdown to sanitised HTML for the admin editor preview. */
export async function previewMarkdownAction(markdown: string): Promise<string> {
  const user = await getCurrentUser();
  if (!user) return "<p>Sign in to preview.</p>";
  return renderMarkdown(String(markdown ?? "").slice(0, 80000));
}
