/**
 * Capture the screenshots of the interactive demos that project pages show
 * under "Software screens" (public/demo-screens/<demo>/<screen>.webp).
 *
 * Re-run it after changing a demo:
 *   1. npm run dev                      (or any server serving the site)
 *   2. run this file with a Playwright-compatible runner that calls the default
 *      export with a `page`, e.g. the browser-automation skill:
 *        browser.mjs http://localhost:3000/demos --script scripts/capture-demo-screens.mjs
 *
 * BASE_URL overrides the server address. Every image is a real capture of the
 * running demo on its sample data, never a mock-up.
 */
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const sharp = createRequire(path.join(process.cwd(), "package.json"))("sharp");
const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const OUT = path.join(process.cwd(), "public", "demo-screens");
const APP = "[data-demo-app]";
/** MOBILE_ONLY=1 re-captures just the phone-width screens. */
const MOBILE_ONLY = process.env.MOBILE_ONLY === "1";

const click = (page, name) => page.getByRole("button", { name }).first().click();

/** Screens per demo, with an optional step that puts some life on the screen first. */
const PLAN = {
  pos: {
    mobile: "sell",
    screens: {
      dashboard: null,
      sell: async (p) => {
        await click(p, /Rice 5kg/);
        await click(p, /Sugar 1kg/);
        await click(p, /Sugar 1kg/);
        await click(p, /Mineral water/);
      },
      products: null,
      reports: null,
      settings: null,
    },
  },
  ikimina: { mobile: "dashboard", screens: { dashboard: null, members: null, savings: null, loans: null, repayments: null, reports: null } },
  bistro: {
    mobile: "orders",
    screens: {
      dashboard: null,
      orders: async (p) => {
        await click(p, /Grilled tilapia/);
        await click(p, /Beef brochettes/);
        await click(p, /Beef brochettes/);
      },
      menu: null,
      bills: null,
      reports: null,
    },
  },
  certificates: {
    mobile: "generate",
    screens: {
      dashboard: null,
      generate: async (p) => p.fill("#ce-name", "Sample Student Four"),
      issued: null,
      verify: async (p) => p.locator("form").getByRole("button", { name: "Verify" }).click(),
      courses: null,
    },
  },
  transport: { mobile: "book", screens: { dashboard: null, book: null, vehicles: null, bookings: null, reports: null } },
  exam: {
    mobile: "exam",
    screens: {
      dashboard: null,
      exam: async (p) => {
        await click(p, "Start the sample exam");
        await p.getByRole("radio").nth(1).click();
      },
      results: null,
      questions: null,
      settings: null,
    },
  },
  audit: { mobile: "papers", screens: { dashboard: null, papers: async (p) => click(p, /C\. Internal controls/), review: null, reports: null } },
};

async function open(page, key, query) {
  await page.goto(`${BASE}/demos/${key}?${query}`);
  await page.waitForSelector(APP);
  await page.waitForFunction(() => !document.body.textContent.includes("Loading the demo"));
  // Hide the framework's dev overlay and the entrance animation so captures are clean.
  await page.addStyleTag({ content: "nextjs-portal,body>div>header,.rm-banner{display:none!important} header.sticky{display:none!important} *{animation:none!important;transition:none!important}" });
}

async function save(page, key, name, width) {
  const dir = path.join(OUT, key);
  await mkdir(dir, { recursive: true });
  const png = await page.locator(APP).screenshot();
  const file = path.join(dir, `${name}.webp`);
  const info = await sharp(png).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(file);
  return `${key}/${name}.webp ${info.width}x${info.height} ${Math.round(info.size / 1024)}KB`;
}

export default async function run(page) {
  const done = [];
  for (const [key, plan] of Object.entries(PLAN)) {
    await page.setViewportSize({ width: 1280, height: 900 });
    if (!MOBILE_ONLY) {
      await open(page, key, "");
      done.push(await save(page, key, "login", 1280));
    }
    for (const [screen, prepare] of Object.entries(MOBILE_ONLY ? {} : plan.screens)) {
      await open(page, key, `auth=1&screen=${screen}`);
      if (prepare) await prepare(page);
      await page.waitForTimeout(150);
      done.push(await save(page, key, screen, 1280));
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, key, `auth=1&screen=${plan.mobile}`);
    const prepare = plan.screens[plan.mobile];
    if (prepare) await prepare(page);
    await page.waitForTimeout(150);
    done.push(await save(page, key, "mobile", 780));
  }
  return done;
}
