import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { resolveLocalFile } from "@/lib/storage/local";
import { blobStore } from "@/lib/storage/netlify-blobs";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

/**
 * Serves files written by the local storage adapter with long cache headers.
 * Keys are random, so files are effectively immutable.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await ctx.params;
  const key = segments.join("/");
  if (!key || segments.some((s) => s === ".." || s.includes("\\"))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const ext = path.extname(key).toLowerCase();
  const provider = (process.env.STORAGE_PROVIDER ?? "local").toLowerCase();
  if (provider === "netlify-blobs" || provider === "netlify") {
    try {
      const blob = await blobStore().get(key, { type: "stream" });
      if (!blob) return new NextResponse("Not found", { status: 404 });
      return new NextResponse(blob, {
        headers: {
          "Content-Type": MIME[ext] ?? "application/octet-stream",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Content-Type-Options": "nosniff",
          ...(ext === ".pdf" ? { "Content-Disposition": "inline" } : {}),
        },
      });
    } catch {
      return new NextResponse("Not found", { status: 404 });
    }
  }
  let filePath: string;
  try {
    filePath = resolveLocalFile(key);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) return new NextResponse("Not found", { status: 404 });
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new NextResponse(stream, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Content-Length": String(stat.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        ...(ext === ".pdf" ? { "Content-Disposition": "inline" } : {}),
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
