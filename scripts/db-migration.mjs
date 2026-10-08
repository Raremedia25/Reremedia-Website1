#!/usr/bin/env node
/**
 * Create a Netlify Database migration from the Prisma schema.
 *
 *   npm run db:migration -- <slug>
 *
 * Netlify applies the SQL files in netlify/database/migrations on every deploy
 * (and `netlify database migrations apply` does the same for the local
 * database started by `netlify dev`). Prisma's `db push`/`migrate` must not be
 * run against a Netlify-hosted database, so schema changes go through this
 * script instead:
 *
 *   1. Edit prisma/schema.prisma
 *   2. npm run db:migration -- add-newsletter-table
 *   3. Review the generated SQL, then commit it together with the schema.
 *
 * The diff is computed against the database in DATABASE_URL (or NETLIFY_DB_URL)
 * from .env, which should already have every previous migration applied.
 * Without a PostgreSQL URL the script falls back to diffing against an empty
 * database, i.e. it emits the full schema (only right for the first migration).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd();
const dir = path.join(root, "netlify", "database", "migrations");
const slug = (process.argv[2] ?? "")
  .toLowerCase()
  .replace(/[^a-z0-9_-]+/g, "-")
  .replace(/^-+|-+$/g, "");
if (!slug) {
  console.error("Usage: npm run db:migration -- <slug>   e.g. add-newsletter-table");
  process.exit(1);
}

// Minimal .env loader (no extra dependency).
const envFile = path.join(root, ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  }
}
const dbUrl = process.env.DATABASE_URL || process.env.NETLIFY_DB_URL || process.env.NETLIFY_DATABASE_URL;

const from = dbUrl && /^postgres(ql)?:\/\//.test(dbUrl) ? ["--from-url", dbUrl] : ["--from-empty"];
if (from[0] === "--from-empty") {
  console.warn("No PostgreSQL DATABASE_URL found in .env: generating the full schema from an empty database.");
}

// Run the local Prisma CLI directly with Node (no shell, works on Windows too).
const prismaCli = createRequire(import.meta.url).resolve("prisma/build/index.js");
const result = spawnSync(
  process.execPath,
  [prismaCli, "migrate", "diff", ...from, "--to-schema-datamodel", "prisma/schema.prisma", "--script"],
  { cwd: root, encoding: "utf8" },
);
if (result.status !== 0) {
  process.stderr.write(result.stderr ?? "");
  process.exit(result.status ?? 1);
}

const sql = result.stdout
  .replace(/^-- CreateSchema\r?\nCREATE SCHEMA IF NOT EXISTS "public";\r?\n\r?\n/m, "")
  .trim();
if (!sql || /^-- This is an empty migration\.?$/m.test(sql)) {
  console.log("Schema and database are already in sync: no migration created.");
  process.exit(0);
}

const d = new Date();
const stamp = [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()]
  .map((n, i) => String(n).padStart(i === 0 ? 4 : 2, "0"))
  .join("");
mkdirSync(dir, { recursive: true });
const file = path.join(dir, `${stamp}_${slug}.sql`);
writeFileSync(file, `-- Generated from prisma/schema.prisma (${d.toISOString()}). Review before committing.\n\n${sql}\n`);
console.log(`Created ${path.relative(root, file)}`);
console.log("Next: review the SQL, run `netlify database migrations apply` for your local database, commit, deploy.");
