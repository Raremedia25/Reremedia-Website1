/**
 * Screenshots of the interactive demos, captured from the running demo by
 * scripts/capture-demo-screens.mjs into public/demo-screens/<demo>/.
 * Project pages show them under "Software screens" next to any screenshots
 * uploaded from the admin dashboard.
 */
import type { ImageSource } from "@/lib/media/image-src";
import { getDemo } from "./registry";

const SHOTS: Record<string, string[]> = {
  pos: ["dashboard", "sell", "products", "reports", "settings", "login", "mobile"],
  ikimina: ["dashboard", "members", "savings", "loans", "repayments", "reports", "login", "mobile"],
  bistro: ["dashboard", "orders", "menu", "bills", "reports", "login", "mobile"],
  certificates: ["dashboard", "generate", "issued", "verify", "courses", "login", "mobile"],
  transport: ["dashboard", "book", "vehicles", "bookings", "reports", "login", "mobile"],
  exam: ["dashboard", "exam", "results", "questions", "settings", "login", "mobile"],
  audit: ["dashboard", "papers", "review", "reports", "login", "mobile"],
};

export interface DemoShot {
  image: ImageSource;
  label: string;
  /** Deep link that opens the demo on this screen. */
  href: string;
  mobile: boolean;
}

export function getDemoShots(key: string): DemoShot[] {
  const demo = getDemo(key);
  if (!demo) return [];
  return (SHOTS[key] ?? []).map((name) => {
    const label = name === "login" ? "Sign-in" : name === "mobile" ? "Mobile view" : (demo.screens.find((s) => s.id === name)?.label ?? name);
    const url = `/demo-screens/${key}/${name}.webp`;
    return {
      label,
      mobile: name === "mobile",
      href: name === "login" ? `/demos/${key}` : `/demos/${key}?auth=1${name === "mobile" ? "" : `&screen=${name}`}`,
      image: { id: `demo-${key}-${name}`, url, alt: `${demo.title} demo: ${label} screen with sample data`, caption: "", width: null, height: null, srcSet: "", blurDataUrl: null, isDemo: false, source: "UPLOAD" },
    };
  });
}
