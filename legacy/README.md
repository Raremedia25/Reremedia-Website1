# RAREMEDIA — Company Website

Professional marketing website for **RAREMEDIA**, a software development company.
Built with React (JavaScript), Vite and React Router — custom CSS, no UI framework.

## Pages

| Route | Page |
|---|---|
| `/` | Home — hero, stats, services preview, why choose us, portfolio preview, technologies, CTA |
| `/about` | About Us — mission, vision, values, why choose us |
| `/services` | All 7 services with detailed offering lists |
| `/portfolio` | Projects with category filters |
| `/contact` | Contact form + contact info |
| `/privacy-policy` | Privacy policy |

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build for deployment

```bash
npm run build    # output in dist/
npm run preview  # preview the production build
```

The site is a static SPA — deploy the `dist/` folder to any static host
(Netlify, Vercel, GitHub Pages, cPanel, Nginx…). For hosts that don't
rewrite unknown URLs to `index.html`, enable SPA fallback so routes like
`/services` work on refresh.

## Contact form emails (Spring Boot mailer)

The `backend/` folder contains a small Spring Boot service that receives the
contact form's POST and sends two emails through Gmail SMTP:

1. a notification to the company inbox (reply-to set to the client), and
2. an acknowledgment to the client.

### Run it

```bash
cd backend
mvnw.cmd -q -DskipTests package   # builds target/raremedia-mailer.jar
run-mailer.cmd                    # starts it on port 8090
```

`run-mailer.cmd` holds the Gmail address and App Password — **keep that file
private** (it is gitignored). If the App Password ever leaks, revoke it at
https://myaccount.google.com/apppasswords and generate a new one.

The website's `.env` points the form at the mailer:

```
VITE_CONTACT_API_URL=http://localhost:8090/api/contact
```

When deploying, host the jar somewhere reachable (any VPS or Java host),
set `ALLOWED_ORIGINS` to the website's public URL, and update
`VITE_CONTACT_API_URL` before running `npm run build`. While the variable is
unset, the form simulates a successful send so the site still works standalone.

Payload contract: `POST /api/contact` with JSON
`{ fullName, email, phone, company, service, message }` → `{ "success": true }`.

## Editing content

All content lives in `src/data/`:

- `services.js` — the 7 services and their offering lists
- `projects.js` — portfolio projects, categories, tech stacks
- `technologies.js` — technology chips
- `siteInfo.js` — company email, phone, location, social links

Update `siteInfo.js` with the real contact details before going live.
