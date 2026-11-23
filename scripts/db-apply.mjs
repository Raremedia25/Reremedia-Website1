#!/usr/bin/env node
/**
 * Apply the SQL migrations in netlify/database/migrations to a PostgreSQL
 * database that Netlify does not manage (the Vercel + Neon deployment).
 *
 *   npm run db:deploy                 # applies files not applied yet
 *   npm run db:deploy -- --baseline   # records every file as applied without running it
 *
 * Uses TARGET_DATABASE_URL, else DATABASE_URL, from the environment,
 * .env.local or .env. Applied files are tracked in the "_migrations" table.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const root = process.cwd();
const env = { ...process.env };
for (const name of [".env.local", ".env"]) {
  const file = path.join(root, name);
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  }
}

const url = [env.TARGET_DATABASE_URL, env.DATABASE_URL].find((u) => u && /^postgres(ql)?:\/\//i.test(u));
if (!url) {
  console.error("Set TARGET_DATABASE_URL (or DATABASE_URL) to the PostgreSQL connection string.");
  process.exit(1);
}

const dir = path.join(root, "netlify", "database", "migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const baseline = process.argv.includes("--baseline");
const client = new pg.Client({ connectionString: url });

try {
  await client.connect();
  console.log(`Database: ${new URL(url).host}`);
  const tracked = (await client.query("select to_regclass('public._migrations') as t")).rows[0].t !== null;
  const hasTables = (await client.query("select 1 from information_schema.tables where table_schema = 'public' and table_name <> '_migrations' limit 1")).rowCount > 0;
  if (!tracked && hasTables && !baseline) {
    throw new Error("This database already has tables but no migration history. If they match the current migrations, run `npm run db:deploy -- --baseline` once.");
  }
  await client.query('create table if not exists "_migrations" (name text primary key, applied_at timestamptz not null default now())');
  const applied = new Set((await client.query('select name from "_migrations"')).rows.map((r) => r.name));
  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    await client.query("begin");
    try {
      if (!baseline) await client.query(readFileSync(path.join(dir, file), "utf8"));
      await client.query('insert into "_migrations" (name) values ($1)', [file]);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw new Error(`${file}: ${error.message}`);
    }
    console.log(`  ${baseline ? "recorded" : "applied"} ${file}`);
    count++;
  }
  console.log(count ? "Done." : "Nothing to apply.");
} catch (error) {
  console.error(`\n${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
