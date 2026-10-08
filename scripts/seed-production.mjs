#!/usr/bin/env node
/**
 * Seed the Netlify production database and media store from this machine
 * without ever printing the connection string.
 *
 *   npm run db:seed:prod            # uses SEED_ADMIN_* and NETLIFY_* from .env.local
 *
 * It asks the Netlify CLI for the site's database credentials, then runs the
 * normal seed (prisma/seed.ts) with DATABASE_URL set only in the child process
 * environment and STORAGE_PROVIDER=netlify-blobs. Requirements:
 *   - `netlify login` and `netlify link` done for this folder
 *   - NETLIFY_SITE_ID and NETLIFY_API_TOKEN in .env.local (for the Blobs uploads)
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const env = { ...process.env };
// .env.local (machine-only secrets, never bundled) overrides .env.
for (const name of [".env", ".env.local"]) {
  const envFile = path.join(root, name);
  if (!existsSync(envFile)) continue;
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    env[m[1]] = m[2].replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  }
}

// Netlify Blobs needs the site id + an API token when running outside Netlify.
// Fall back to the linked site (.netlify/state.json) and the CLI's own login.
if (!env.NETLIFY_SITE_ID) {
  try {
    env.NETLIFY_SITE_ID = JSON.parse(readFileSync(path.join(root, ".netlify", "state.json"), "utf8")).siteId;
  } catch {
    /* not linked */
  }
}
if (!env.NETLIFY_API_TOKEN) {
  const cfgDir = process.platform === "win32" ? path.join(process.env.APPDATA ?? "", "netlify", "Config") : path.join(process.env.HOME ?? "", ".config", "netlify");
  try {
    const cfg = JSON.parse(readFileSync(path.join(cfgDir, "config.json"), "utf8"));
    const user = cfg.users?.[cfg.userId] ?? Object.values(cfg.users ?? {})[0];
    if (user?.auth?.token) env.NETLIFY_API_TOKEN = user.auth.token;
  } catch {
    /* not logged in */
  }
}
if (!env.NETLIFY_SITE_ID || !env.NETLIFY_API_TOKEN) {
  console.error("Netlify site id / API token not found: run `netlify login` and `netlify link`, or set NETLIFY_SITE_ID and NETLIFY_API_TOKEN in .env.local.");
  process.exit(1);
}

/**
 * Production connection string. The site-level endpoint returns the
 * read-write connection the deployed app itself uses (NETLIFY_DB_URL);
 * `netlify database status --branch production --show-credentials` only
 * exposes a read-only role, which is kept as a fallback for inspection.
 */
async function fetchSiteConnectionString() {
  const res = await fetch(`https://api.netlify.com/api/v1/sites/${encodeURIComponent(env.NETLIFY_SITE_ID)}/database/`, {
    headers: { Authorization: `Bearer ${env.NETLIFY_API_TOKEN}` },
  });
  if (!res.ok) throw new Error(`GET /sites/{id}/database -> ${res.status}`);
  const data = await res.json();
  if (!data.connection_string) throw new Error("No connection_string in the site database response.");
  return data.connection_string;
}
function fetchBranchConnectionString(branch) {
  const netlify = process.platform === "win32" ? "netlify.cmd" : "netlify";
  const status = spawnSync(netlify, ["database", "status", "--branch", branch, "--json", "--show-credentials"], {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (status.status !== 0) throw new Error(status.stderr || status.stdout || "netlify database status failed");
  const url = JSON.parse(status.stdout)?.database?.connectionString;
  if (!url) throw new Error("No connection string in `netlify database status` output.");
  return url;
}

const branch = env.NETLIFY_DB_BRANCH || "production";
let url;
if (env.PRODUCTION_DATABASE_URL && /^postgres(ql)?:\/\//i.test(env.PRODUCTION_DATABASE_URL)) {
  // Read-write string copied from the Netlify dashboard (Database → production
  // branch → copy connection string) into .env.local.
  url = env.PRODUCTION_DATABASE_URL;
} else {
  try {
    url = await fetchSiteConnectionString();
  } catch (error) {
    console.warn(`Site database endpoint unavailable (${error.message}); falling back to the "${branch}" branch credentials.`);
    url = fetchBranchConnectionString(branch);
  }
}
const parsed = new URL(url);
console.log(`Seeding database on ${parsed.host} as role "${parsed.username}" (provider: netlify-blobs, admin: ${env.SEED_ADMIN_EMAIL ?? "admin@raremedia.local"})`);
if (/readonly/i.test(parsed.username)) {
  console.error(
    "The Netlify API only gives this login a read-only role. Copy the production branch's full connection string from the Netlify dashboard (Database → production → Copy connection string) into .env.local as PRODUCTION_DATABASE_URL and run this again.",
  );
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "prisma/seed.ts", ...process.argv.slice(2)],
  {
    cwd: root,
    stdio: "inherit",
    env: { ...env, DATABASE_URL: url, STORAGE_PROVIDER: "netlify-blobs" },
  },
);
process.exit(result.status ?? 1);
