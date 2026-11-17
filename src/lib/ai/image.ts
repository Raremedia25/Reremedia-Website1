/**
 * AI image generation for the admin media picker ("Generate with AI").
 *
 * Provider: OpenAI Images API. Configure in the site environment (never in
 * code, never exposed to the browser):
 *   OPENAI_API_KEY    required; without it the feature reports "not configured"
 *   IMAGE_GEN_MODEL   optional, default "gpt-image-2"
 *   IMAGE_GEN_QUALITY optional, "low" | "medium" | "high", default "medium"
 *
 * Every generated picture is stored with source "AI_GENERATED", so the public
 * site labels it and it cannot be mistaken for a photo of a real customer.
 */

const ENDPOINT = "https://api.openai.com/v1/images/generations";

/** Appended to every prompt so results stay usable as honest illustrations. */
const GUARDRAILS = "Photorealistic, natural light. No text, captions, logos, brand names or watermarks. Do not depict any real, identifiable person, company or landmark.";

export class ImageGenerationError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}

export function imageGenerationConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY?.trim();
}

export async function generateImage(prompt: string): Promise<{ buffer: Buffer; mime: "image/jpeg"; model: string }> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new ImageGenerationError("AI image generation is not configured. Add OPENAI_API_KEY to the site environment.", 503);
  const model = process.env.IMAGE_GEN_MODEL?.trim() || "gpt-image-2";
  const quality = ["low", "medium", "high"].includes(process.env.IMAGE_GEN_QUALITY ?? "") ? process.env.IMAGE_GEN_QUALITY : "medium";

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: `${prompt}\n\n${GUARDRAILS}`, n: 1, size: "1536x1024", quality, output_format: "jpeg" }),
      signal: AbortSignal.timeout(110_000),
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    throw new ImageGenerationError(timedOut ? "The image provider took too long. Try again or use a lower quality setting." : "Could not reach the image provider.", 504);
  }

  const json = (await res.json().catch(() => null)) as { data?: Array<{ b64_json?: string }>; error?: { message?: string } } | null;
  if (!res.ok) {
    // Provider messages are safe to show to an admin (prompt rejected, quota, bad key) and never contain the key.
    const reason = json?.error?.message?.slice(0, 300) || `Image provider returned ${res.status}.`;
    throw new ImageGenerationError(res.status === 401 ? "The image provider rejected the API key. Check OPENAI_API_KEY." : reason, res.status === 400 ? 400 : 502);
  }
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new ImageGenerationError("The image provider returned no image.");
  return { buffer: Buffer.from(b64, "base64"), mime: "image/jpeg", model };
}
