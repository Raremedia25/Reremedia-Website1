/**
 * Catalogue of the interactive product demos served under /demos/[key].
 *
 * This file is plain data (no React), so server components, the admin form,
 * the sitemap and the seed script can all read it. The demos themselves live
 * next to it and are loaded on demand by DemoRunner.
 */

export interface DemoProps {
  /** Open the demo on this screen (used by deep links such as ?screen=reports). */
  initialScreen?: string;
  /** Skip the simulated sign-in screen. */
  skipLogin?: boolean;
  /** Encoded sample certificate to verify (certificate demo only). */
  verify?: string;
}

export interface DemoMeta {
  key: string;
  /** Product name. */
  title: string;
  /** One line shown on cards. */
  tagline: string;
  description: string;
  accent: string;
  /** Things a visitor can do in the demo. */
  tryIt: string[];
  /** Screens of the demo, in sidebar order. */
  screens: Array<{ id: string; label: string }>;
  /** Used to link a project to this demo automatically when no demo is chosen in the admin. */
  match: RegExp;
}

export const DEMOS: DemoMeta[] = [
  {
    key: "pos",
    title: "Raremedia POS",
    tagline: "Add products to a cart, complete a sale and print a sample receipt.",
    description: "A point-of-sale counter for shops: product search, cart, stock that goes down as you sell, daily reports and receipts.",
    accent: "#0891b2",
    tryIt: ["Add products to the cart and change quantities", "Complete a simulated cash or Mobile Money sale", "Open the sample receipt", "Watch stock levels and reports update", "Add a new product to the catalogue"],
    screens: [
      { id: "dashboard", label: "Dashboard" },
      { id: "sell", label: "New sale" },
      { id: "products", label: "Products & stock" },
      { id: "sales", label: "Sales" },
      { id: "reports", label: "Reports" },
      { id: "settings", label: "Settings" },
    ],
    match: /\bpos\b|point.of.sale|\bshop\b|inventory/i,
  },
  {
    key: "ikimina",
    title: "Ikimina Management",
    tagline: "Register a member, record savings and calculate a loan.",
    description: "Savings-group and cooperative management: members, contributions, loans with a repayment schedule and group reports.",
    accent: "#7c3aed",
    tryIt: ["Register a sample member", "Record a savings contribution", "Calculate a loan and see the repayment schedule", "Issue the loan and record repayments", "Read the group report"],
    screens: [
      { id: "dashboard", label: "Dashboard" },
      { id: "members", label: "Members" },
      { id: "savings", label: "Savings" },
      { id: "loans", label: "Loans" },
      { id: "repayments", label: "Repayments" },
      { id: "reports", label: "Reports" },
      { id: "settings", label: "Settings" },
    ],
    match: /ikimina|savings.group|sacco|cooperative/i,
  },
  {
    key: "bistro",
    title: "Le Bistro Du Coin",
    tagline: "Open a table, take an order, calculate the bill and print a receipt.",
    description: "Restaurant and bar ordering: tables, menu, running orders, service charge, bills and a sample receipt.",
    accent: "#d97706",
    tryIt: ["Pick a table and add dishes and drinks", "Change quantities on the order", "See the bill with service charge", "Settle the bill and open the sample receipt", "Check the day's sales by menu category"],
    screens: [
      { id: "dashboard", label: "Dashboard" },
      { id: "orders", label: "Tables & orders" },
      { id: "menu", label: "Menu" },
      { id: "bills", label: "Bills" },
      { id: "reports", label: "Reports" },
      { id: "settings", label: "Settings" },
    ],
    match: /bistro|restaurant|\bbar\b/i,
  },
  {
    key: "certificates",
    title: "Certificate Generator",
    tagline: "Enter a student, pick a course and preview a certificate with a QR code.",
    description: "Training certificates: enter student details, choose a course, preview the certificate and verify it through its QR code.",
    accent: "#059669",
    tryIt: ["Type a student name and choose a course", "Watch the certificate preview update live", "Issue the sample certificate", "Scan or open the QR code to verify it", "Look up a certificate by its number"],
    screens: [
      { id: "dashboard", label: "Dashboard" },
      { id: "generate", label: "Generate" },
      { id: "issued", label: "Certificates" },
      { id: "verify", label: "Verify" },
      { id: "courses", label: "Courses" },
      { id: "settings", label: "Settings" },
    ],
    match: /certificate/i,
  },
  {
    key: "transport",
    title: "UMUSARE Transport",
    tagline: "Choose a vehicle, book a trip and follow the route on a map.",
    description: "Transport booking: available cars and motorcycles, fare estimates, trip booking and a route drawn on a sample map.",
    accent: "#2563eb",
    tryIt: ["Choose pick-up and destination", "Compare a car and a motorcycle fare", "Confirm a simulated booking", "See the route on the sample map", "Move the trip through its statuses"],
    screens: [
      { id: "dashboard", label: "Dashboard" },
      { id: "book", label: "Book a trip" },
      { id: "vehicles", label: "Vehicles" },
      { id: "bookings", label: "Bookings" },
      { id: "reports", label: "Reports" },
      { id: "settings", label: "Settings" },
    ],
    match: /umusare|transport|taxi|\bride\b/i,
  },
  {
    key: "exam",
    title: "Recruitment Examination",
    tagline: "Sit a short timed sample exam and get your result immediately.",
    description: "Online recruitment testing: a timed examination, automatic marking, pass mark, results and a question bank.",
    accent: "#4f46e5",
    tryIt: ["Start the timed sample examination", "Answer the demonstration questions", "Submit and see your score against the pass mark", "Review each answer", "Compare with the sample results list"],
    screens: [
      { id: "dashboard", label: "Dashboard" },
      { id: "exam", label: "Take the exam" },
      { id: "results", label: "Results" },
      { id: "questions", label: "Question bank" },
      { id: "settings", label: "Settings" },
    ],
    match: /recruit/i,
  },
  {
    key: "audit",
    title: "Audit Working Papers",
    tagline: "Browse audit folders, open a working paper and sign it off.",
    description: "Audit file management: indexed folders, working papers with objective, work done and conclusion, and a review trail.",
    accent: "#0f766e",
    tryIt: ["Browse the indexed audit folders", "Open a sample working paper", "Mark a paper as reviewed", "Move a paper to another folder", "Create a new working paper"],
    screens: [
      { id: "dashboard", label: "Dashboard" },
      { id: "papers", label: "Working papers" },
      { id: "review", label: "Review status" },
      { id: "reports", label: "Reports" },
      { id: "settings", label: "Settings" },
    ],
    match: /audit|working.paper/i,
  },
];

export const DEMO_KEYS = DEMOS.map((d) => d.key);

/** Value stored in Project.demoKey to switch the demo off for a project. */
export const DEMO_NONE = "none";

export function getDemo(key: string | null | undefined): DemoMeta | null {
  return DEMOS.find((d) => d.key === key) ?? null;
}

/**
 * Which demo belongs to a project.
 * - An explicit choice made in the admin always wins ("none" switches it off).
 * - Otherwise the project title is matched against each demo, most specific first.
 */
export function resolveDemo(project: { demoKey?: string | null; title: string }): DemoMeta | null {
  if (project.demoKey === DEMO_NONE) return null;
  const explicit = getDemo(project.demoKey);
  if (explicit) return explicit;
  const order = ["ikimina", "bistro", "certificates", "transport", "exam", "audit", "pos"];
  for (const key of order) {
    const demo = getDemo(key);
    if (demo && demo.match.test(project.title)) return demo;
  }
  return null;
}
