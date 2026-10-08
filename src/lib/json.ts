// Helpers for list fields stored as JSON strings (portable across SQLite/Postgres).

export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function stringifyList(values: string[] | undefined | null): string {
  return JSON.stringify((values ?? []).map((v) => v.trim()).filter(Boolean));
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Split a textarea's lines (or comma list) into a clean string array. */
export function linesToList(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}
