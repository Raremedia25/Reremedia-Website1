#!/usr/bin/env node
/**
 * One-time copy of the live Netlify data to the Vercel + Neon setup.
 *
 *   node scripts/migrate-to-vercel.mjs db      # Netlify Database -> TARGET_DATABASE_URL
 *   node scripts/migrate-to-vercel.mjs media   # Netlify Blobs    -> Vercel Blob
 *
 * Nothing on Netlify is changed: both steps only read from it.
 *
 * db     Needs TARGET_DATABASE_URL (the new PostgreSQL database, use the
 *        direct, non-pooled connection string) in .env.local. Creates the
 *        tables from netlify/database/migrations when the target is empty,
 *        copies every row, and marks media rows as stored in Vercel Blob.
 *        Refuses to touch a target that already has rows unless --force is
 *        passed (which empties the target tables first).
 * media  Needs BLOB_READ_WRITE_TOKEN (from the Vercel Blob store) in
 *        .env.local. Uploads every file of the Netlify "media" store under
 *        the same key. Safe to re-run: files are simply written again.
 *        `--list` only counts the files.
 *
 * The source is found through the Netlify CLI login and the linked site
 * (`netlify login`, `netlify link`); SOURCE_DATABASE_URL overrides it.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import pg from "pg";

const root = process.cwd();
const [step, ...flags] = process.argv.slice(2);
const force = flags.includes("--force");

const env = { ...process.env };
for (const name of [".env", ".env.local"]) {
  const file = path.join(root, name);
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) env[m[1]] = m[2].replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  }
}

function netlifyCredentials() {
  let siteId = env.NETLIFY_SITE_ID;
  let token = env.NETLIFY_API_TOKEN;
  if (!siteId) {
    try {
      siteId = JSON.parse(readFileSync(path.join(root, ".netlify", "state.json"), "utf8")).siteId;
    } catch {
      /* not linked */
    }
  }
  if (!token) {
    const dir = process.platform === "win32" ? path.join(process.env.APPDATA ?? "", "netlify", "Config") : path.join(os.homedir(), ".config", "netlify");
    try {
      const cfg = JSON.parse(readFileSync(path.join(dir, "config.json"), "utf8"));
      token = (cfg.users?.[cfg.userId] ?? Object.values(cfg.users ?? {})[0])?.auth?.token;
    } catch {
      /* not logged in */
    }
  }
  if (!siteId || !token) throw new Error("Netlify site id / API token not found: run `netlify login` and `netlify link` first.");
  return { siteId, token };
}

async function sourceDatabaseUrl() {
  if (env.SOURCE_DATABASE_URL) return env.SOURCE_DATABASE_URL;
  const { siteId, token } = netlifyCredentials();
  const res = await fetch(`https://api.netlify.com/api/v1/sites/${encodeURIComponent(siteId)}/database/`, { headers: { Authorization: `Bearer ${token}` } });
  if (res.ok) {
    const data = await res.json();
    if (data.connection_string) return data.connection_string;
  }
  // A read-only role is enough for copying.
  const status = spawnSync("netlify", ["database", "status", "--branch", "production", "--json", "--show-credentials"], { cwd: root, encoding: "utf8", shell: true });
  const url = status.status === 0 ? JSON.parse(status.stdout)?.database?.connectionString : null;
  if (!url) throw new Error("Could not get the Netlify database connection string. Set SOURCE_DATABASE_URL in .env.local.");
  return url;
}

const quote = (name) => `"${name.replace(/"/g, '""')}"`;

async function copyDatabase() {
  const targetUrl = env.TARGET_DATABASE_URL;
  if (!targetUrl || !/^postgres(ql)?:\/\//i.test(targetUrl)) throw new Error("Set TARGET_DATABASE_URL (the new PostgreSQL database) in .env.local.");
  const sourceUrl = await sourceDatabaseUrl();
  if (new URL(sourceUrl).host === new URL(targetUrl).host && new URL(sourceUrl).pathname === new URL(targetUrl).pathname) {
    throw new Error("Source and target are the same database.");
  }

  // Values travel as text, exactly as PostgreSQL prints them, so no type is reinterpreted on the way.
  const source = new pg.Client({ connectionString: sourceUrl, types: { getTypeParser: () => (value) => value } });
  const target = new pg.Client({ connectionString: targetUrl });
  await source.connect();
  await target.connect();
  console.log(`Copying ${new URL(sourceUrl).host} -> ${new URL(targetUrl).host}`);

  const listTables = async (client) =>
    (await client.query("select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name")).rows.map((r) => r.table_name);

  if ((await listTables(target)).length === 0) {
    const dir = path.join(root, "netlify", "database", "migrations");
    // Same bookkeeping as scripts/db-apply.mjs, so later `npm run db:deploy` runs only newer files.
    await target.query('create table "_migrations" (name text primary key, applied_at timestamptz not null default now())');
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
      await target.query(readFileSync(path.join(dir, file), "utf8"));
      await target.query('insert into "_migrations" (name) values ($1)', [file]);
      console.log(`  created tables from ${file}`);
    }
  }

  const targetTables = new Set(await listTables(target));
  const tables = (await listTables(source)).filter((t) => targetTables.has(t));
  if (tables.length === 0) throw new Error("No common tables between source and target.");

  const nonEmpty = [];
  for (const t of tables) if ((await target.query(`select 1 from ${quote(t)} limit 1`)).rowCount) nonEmpty.push(t);
  if (nonEmpty.length && !force) throw new Error(`The target already has rows in: ${nonEmpty.join(", ")}. Re-run with --force to replace them.`);

  // Foreign keys are dropped for the copy and restored afterwards, so table order does not matter.
  const fks = (
    await target.query(
      "select conrelid::regclass::text as tbl, conname, pg_get_constraintdef(oid) as def from pg_constraint where contype = 'f' and connamespace = 'public'::regnamespace",
    )
  ).rows;
  await target.query("begin");
  try {
    for (const fk of fks) await target.query(`alter table ${fk.tbl} drop constraint ${quote(fk.conname)}`);
    for (const t of tables) {
      if (nonEmpty.includes(t)) await target.query(`delete from ${quote(t)}`);
      const { rows, fields } = await source.query(`select * from ${quote(t)}`);
      const columns = fields.map((f) => f.name);
      const perBatch = Math.max(1, Math.floor(1000 / Math.max(1, columns.length)));
      for (let i = 0; i < rows.length; i += perBatch) {
        const batch = rows.slice(i, i + perBatch);
        const values = [];
        const tuples = batch.map((row) => `(${columns.map((c) => (values.push(row[c]), `$${values.length}`)).join(",")})`);
        await target.query(`insert into ${quote(t)} (${columns.map(quote).join(",")}) values ${tuples.join(",")}`, values);
      }
      console.log(`  ${t}: ${rows.length} rows`);
    }
    for (const fk of fks) await target.query(`alter table ${fk.tbl} add constraint ${quote(fk.conname)} ${fk.def}`);
    if (targetTables.has("Media")) {
      const moved = await target.query(`update "Media" set provider = 'vercel-blob' where provider in ('netlify-blobs', 'netlify')`);
      console.log(`  Media: ${moved.rowCount} rows now point at Vercel Blob`);
    }
    await target.query("commit");
  } catch (error) {
    await target.query("rollback");
    throw error;
  }

  for (const t of tables) {
    const a = (await source.query(`select count(*) as n from ${quote(t)}`)).rows[0].n;
    const b = (await target.query(`select count(*) as n from ${quote(t)}`)).rows[0].n;
    if (String(a) !== String(b)) throw new Error(`Row count mismatch in ${t}: source ${a}, target ${b}.`);
  }
  console.log("Database copied; row counts match in every table.");
  await source.end();
  await target.end();
}

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml", ".pdf": "application/pdf" };

async function copyMedia() {
  const { getStore } = await import("@netlify/blobs");
  const { siteId, token } = netlifyCredentials();
  const store = getStore({ name: "media", siteID: siteId, token });
  const { blobs } = await store.list();
  console.log(`${blobs.length} files in Netlify Blobs.`);
  if (flags.includes("--list")) return;

  const blobToken = env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) throw new Error("Set BLOB_READ_WRITE_TOKEN (from the Vercel Blob store) in .env.local.");
  const { put } = await import("@vercel/blob");

  const keys = blobs.map((b) => b.key);
  const failed = [];
  let index = 0;
  let finished = 0;
  const worker = async () => {
    while (index < keys.length) {
      const key = keys[index++];
      try {
        const data = await store.get(key, { type: "arrayBuffer" });
        if (!data) throw new Error("missing in Netlify");
        const contentType = MIME[path.extname(key).toLowerCase()] ?? "application/octet-stream";
        await put(key, Buffer.from(data), { access: "public", contentType, addRandomSuffix: false, allowOverwrite: true, token: blobToken });
      } catch (error) {
        failed.push(key);
        console.error(`  failed: ${key} (${error.message})`);
      }
      if (++finished % 25 === 0) console.log(`  ${finished}/${keys.length}`);
    }
  };
  await Promise.all([1, 2, 3, 4].map(worker));
  if (failed.length) throw new Error(`${failed.length} files failed. Fix the cause and run the command again.`);
  console.log(`All ${keys.length} files copied to Vercel Blob.`);
}

try {
  if (step === "db") await copyDatabase();
  else if (step === "media") await copyMedia();
  else {
    console.error("Usage: node scripts/migrate-to-vercel.mjs <db|media> [--force]");
    process.exit(1);
  }
} catch (error) {
  console.error(`\n${error.message}`);
  process.exit(1);
}
