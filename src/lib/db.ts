import { PrismaClient } from "@prisma/client";

// Reuse a single Prisma client across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Resolve the PostgreSQL connection string.
 *
 * - DATABASE_URL takes precedence when set (local PostgreSQL, CI, other hosts).
 * - NETLIFY_DB_URL is injected by Netlify Database (production, deploy previews
 *   and the local database started by `netlify dev`).
 * - NETLIFY_DATABASE_URL is the variable of the older Netlify DB / Neon extension.
 *
 * Neon-style pooled endpoints ("-pooler") run PgBouncer in transaction mode,
 * which Prisma must be told about.
 */
export function resolveDatabaseUrl(): string | undefined {
  // Only accept PostgreSQL URLs so a stale local value (e.g. "file:./dev.db"
  // baked in by a local build) can never shadow the Netlify-provided one.
  const url = [process.env.DATABASE_URL, process.env.NETLIFY_DB_URL, process.env.NETLIFY_DATABASE_URL].find(
    (u) => u && /^postgres(ql)?:\/\//i.test(u),
  );
  if (!url) return undefined;
  if (url.includes("-pooler") && !url.includes("pgbouncer=")) {
    return url + (url.includes("?") ? "&" : "?") + "pgbouncer=true&connection_limit=1";
  }
  return url;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolveDatabaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
