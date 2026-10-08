# Raremedia Platform

Company website, portfolio, image gallery, blog, project-request platform and
admin CMS for **Raremedia** (software development & digital technology, Rwanda).

Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Prisma 6 · PostgreSQL (Netlify Database) · Netlify Blobs · sharp**.

```
Websites → Business Systems → Advanced Platforms → AI-Powered Solutions
```

---

## Quick start

You need Node.js 22, the Netlify CLI and a Netlify site with Netlify Database
(see [Deployment](#deployment-netlify) for the one-time setup). `netlify dev`
then starts a local PostgreSQL for you, no Docker or Postgres install needed.

```bash
npm install
npm install -g netlify-cli && netlify login && netlify link
cp .env.example .env                  # edit AUTH_SECRET, SEED_ADMIN_*, NEXT_PUBLIC_SITE_URL
netlify database migrations apply     # create the tables in the local database
netlify database status --show-credentials   # copy the local URL into .env as DATABASE_URL
npm run db:seed                       # admin account, categories, services, demo content
netlify dev                           # http://localhost:8888 (proxies next dev)
```

Sign in at **/admin/login** with the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
from your `.env` (defaults: `admin@raremedia.local` / `ChangeMe123!`).
**Change the password immediately** under *My account*.

> Any other PostgreSQL server also works: set `DATABASE_URL` in `.env`, run
> `npm run db:push && npm run db:seed`, then `npm run dev`. For an offline
> experiment without PostgreSQL, set `provider = "sqlite"` in
> `prisma/schema.prisma` and `DATABASE_URL="file:./dev.db"`, run `npm run setup`,
> and switch the provider back to `postgresql` before committing: Netlify builds
> whatever is in the repository.

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Development server (needs `DATABASE_URL` in `.env`; prefer `netlify dev`) |
| `npm run build` / `npm start` | Production build / server (stop a running `next start` before building on Windows: Prisma needs to replace a locked DLL) |
| `npm run typecheck` | TypeScript check |
| `npm run db:migration -- <slug>` | Generate a SQL migration in `netlify/database/migrations` from `prisma/schema.prisma` |
| `npm run db:seed` | Seed admin, categories, services, settings and demo content (safe to re-run) |
| `npm run db:seed -- --force` | Re-create the demo projects/posts/images |
| `npm run db:push` / `db:migrate` | Prisma schema sync for a **non-Netlify** PostgreSQL/SQLite database only |
| `npm run db:studio` | Prisma Studio (database browser) |

---

## What is included

### Public website (`src/app/(site)`)
| Route | Page |
|---|---|
| `/` | Home: hero, services, solutions, featured projects, process, testimonials, technologies, latest posts, CTA |
| `/services` | Services (from the CMS) + technologies |
| `/solutions` | Solutions for every business (industries) |
| `/projects`, `/projects/[slug]` | Portfolio with category filter + search; project pages with gallery, features, technologies, status, demo/GitHub links, "Request a similar system" |
| `/portfolio` | Public image gallery with lightbox, filters and search |
| `/blog`, `/blog/[slug]` | Blog / updates with categories, tags, pagination |
| `/about` | Mission, vision, values, process, client testimonials |
| `/contact` | Contact form, email, phone, WhatsApp |
| `/request-project` | Structured project request form with optional attachment |
| `/search` | Global search: projects, services, posts, categories |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | SEO |

Every project and post has its own meta title/description, Open Graph and
Twitter cards, canonical URL and JSON-LD.

### Admin dashboard (`/admin`)
Overview · Projects · Posts · Testimonials · Images · Services · Categories ·
Messages · Project Requests · Users · Analytics · Activity log · Settings ·
Notifications · My account.

Workflow: **Create → upload images → add information → save draft → preview → publish.**
Published content appears on the public site immediately (pages are revalidated
on every change). Scheduled items go live automatically when their time passes.

### Roles
| Role | Can |
|---|---|
| **Super Admin** | Everything, including users and settings |
| **Content Manager** | Projects, posts, testimonials, images, services, categories, messages, requests |
| **Project Manager** | Projects, images, project requests |
| **Viewer** | Read-only dashboard and analytics |

Permissions are defined in `src/lib/constants.ts` (`ROLE_PERMISSIONS`) and
enforced in every page, server action and API route (`assertPermission`).

### Images
* Upload one or many files (drag & drop), JPG/PNG/WebP, size limit `MAX_UPLOAD_MB`.
* Files are verified with `sharp`, metadata stripped, re-encoded and resized to
  responsive WebP variants (480/960/1440/1920) plus a blur placeholder.
* Galleries: reorder (drag or arrows), captions, set featured, remove.
* Replace an image in place (all pages using it update), edit alt/caption/folder, delete (files removed from storage).

---

## Configuration (`.env`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. Not needed on Netlify or under `netlify dev`: Netlify Database injects `NETLIFY_DB_URL`, which is used when `DATABASE_URL` is unset |
| `AUTH_SECRET` | Long random string used to sign admin session cookies |
| `NEXT_PUBLIC_SITE_URL` | Public URL (sitemap, canonical, Open Graph) |
| `SEED_ADMIN_NAME/EMAIL/PASSWORD` | First Super Admin created by the seed |
| `STORAGE_PROVIDER` | `netlify-blobs` (production), `local` (default, writes to disk) or `cloudinary` |
| `NETLIFY_SITE_ID`, `NETLIFY_API_TOKEN` | Only needed to write to Netlify Blobs from outside Netlify (e.g. seeding from your machine) |
| `UPLOADS_DIR` | Folder for local uploads (served via `/uploads/*`) |
| `MAX_UPLOAD_MB` | Upload size limit |
| `CLOUDINARY_*` | Cloudinary credentials when `STORAGE_PROVIDER=cloudinary` |
| `SMTP_*`, `NOTIFY_EMAIL` | Email notifications for new messages/requests (logged to console when unset) |

### Database
`prisma/schema.prisma` is the source of truth for the data model and generates
the typed Prisma client (for Windows/macOS/Linux and for Netlify Functions,
`rhel-openssl-3.0.x`). The **schema itself ships as plain SQL migrations** in
`netlify/database/migrations/`, which Netlify Database applies right before a
deploy is published (and `netlify database migrations apply` applies locally).

To change the schema:
1. Edit `prisma/schema.prisma`.
2. `npm run db:migration -- <slug>` diffs the schema against your local
   database (`DATABASE_URL` in `.env`) and writes
   `netlify/database/migrations/<timestamp>_<slug>.sql`. Review it.
3. `netlify database migrations apply` locally, commit schema + SQL, deploy.

Never edit or delete an applied migration, and never run `prisma db push` /
`prisma migrate` against a Netlify-hosted database. `src/lib/db.ts` picks
`DATABASE_URL`, then `NETLIFY_DB_URL`, and adds PgBouncer flags for pooled
(`-pooler`) endpoints. Public pages are rendered on request
(`dynamic = "force-dynamic"`), so `next build` never needs a database.

### Media storage
`src/lib/storage/` contains a small adapter interface (`put`, `delete`, `urlFor`):
* `netlify-blobs.ts` stores files in the Netlify Blobs store `media` (production).
* `local.ts` writes to `UPLOADS_DIR` (development).
* `cloudinary.ts` uploads to Cloudinary via its REST API.

All three are served through the `/uploads/[...path]` route handler with
immutable cache headers. To add S3/Supabase, implement the same interface and
register it in `index.ts`.

---

## Deployment (Netlify)

`netlify.toml` configures the build (`@netlify/plugin-nextjs`, Node 22).
The site uses **Netlify Database** (PostgreSQL, with a branch per deploy
preview) and **Netlify Blobs**, so no separate database or file hosting is
needed. Netlify Database requires a credit-based Netlify plan.

1. **Link the repository to a Netlify site**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify link          # pick the existing Raremedia site, or `netlify init` for a new one
   ```
2. **Database**: nothing to click. Because `@netlify/database` is a dependency,
   Netlify provisions the database automatically on the first deploy and then
   applies `netlify/database/migrations/`. `netlify database status` shows the
   database and the applied/pending migrations at any time.
3. **Set the site environment variables** (dashboard or CLI):
   ```bash
   netlify env:set AUTH_SECRET "<long random string>"      # node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   netlify env:set NEXT_PUBLIC_SITE_URL "https://www.raremedia.com"
   netlify env:set STORAGE_PROVIDER netlify-blobs
   netlify env:set MAX_UPLOAD_MB 10
   # optional: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, NOTIFY_EMAIL
   ```
4. **Deploy**: push to the linked Git branch, or `netlify deploy --build --prod`.
   Netlify builds the app, applies the migrations, then publishes.
5. **Create the first admin** (once). The Netlify CLI and API only expose a
   **read-only** database role, so the app ships a one-shot bootstrap endpoint
   that runs with the runtime credentials. Set a random `SETUP_TOKEN` on the
   site (`netlify env:set SETUP_TOKEN <random> --secret --context production`),
   deploy, then:
   ```bash
   curl -X POST https://raremedia.netlify.app/api/setup \
     -H "Authorization: Bearer <SETUP_TOKEN>" -H "Content-Type: application/json" \
     -d '{"name":"Your Name","email":"you@example.com","password":"a strong password"}'
   ```
   It creates the Super Admin, categories, services and settings, and refuses
   to run once any user exists. Delete `SETUP_TOKEN` afterwards
   (`netlify env:unset SETUP_TOKEN`).

   **Optional demo content** (projects, posts, images) can be seeded from your
   machine: copy the read-write string from the dashboard (*Database →
   production branch → Copy connection string*, Team Owner only) into
   `.env.local` together with the `SEED_ADMIN_*` values:
   ```
   PRODUCTION_DATABASE_URL="postgresql://..."
   SEED_ADMIN_NAME="..."
   SEED_ADMIN_EMAIL="..."
   SEED_ADMIN_PASSWORD="..."
   ```
   then run
   ```bash
   npm run db:seed:prod
   ```
   The script uploads the demo images to Netlify Blobs with your CLI login
   and never prints the credentials. Remove `PRODUCTION_DATABASE_URL` from
   `.env.local` afterwards and sign in at `/admin/login`.

> `next build` copies `.env` into the deployed server bundle (Next.js
> standalone behaviour). Netlify's site variables override it at runtime, but
> keep machine-only secrets (`SEED_ADMIN_*`, `NETLIFY_API_TOKEN`) in
> `.env.local`, which the seed scripts read and the build never bundles.

Schema changes later: see [Database](#database). Commit the generated SQL with
the schema change and redeploy; Netlify applies it before publishing.

### Other hosts
The app is a standard Next.js server (needs Node.js, not a static host):
set the environment variables above, `npm ci && npm run build`, run
`npm run db:push` and `npm run db:seed` once, then `npm start` behind a reverse
proxy with HTTPS. Use `STORAGE_PROVIDER=cloudinary` or keep `storage/uploads`
on persistent disk and in backups.

---

## Project structure

```
prisma/              schema.prisma, seed.ts, seed-data.ts
netlify/database/    SQL migrations applied by Netlify Database on deploy
scripts/             db-migration.mjs (schema → SQL migration)
src/app/             routes (site, admin, api, uploads, sitemap, robots)
src/actions/         server actions (auth, projects, posts, media, catalog, inbox, users, settings)
src/components/site  public UI components
src/components/admin admin UI (shell, forms, media library, picker, gallery manager, editor)
src/lib/             db, auth, permissions, validation, markdown, media processing, storage, queries, settings, mail
legacy/              the previous Vite site + Spring Boot mailer (kept for reference, not used)
```

## Security notes
* Passwords hashed with bcrypt (12 rounds); sessions are signed JWTs in an httpOnly cookie.
* Role-based authorization on every admin page, action and API route; audit log of important actions.
* Zod validation on all inputs, honeypot + rate limiting on public forms, MIME and size checks and real image verification on uploads, path-traversal protection on the upload route.
* Markdown is sanitised before rendering. Security headers are set in `next.config.ts`.
* Never commit `.env`. Rotate `AUTH_SECRET` to sign everyone out.
