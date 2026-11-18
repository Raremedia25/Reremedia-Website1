/**
 * Vector illustrations of the client journey (people asking for a service,
 * planning, building, launching, support). Rendered to PNG with sharp and
 * stored in the media library (folder "journey"). They are illustrations,
 * not photographs, and are labelled as such in their alt text.
 */
import sharp from "sharp";

const BG = ["#0c0a1d", "#1f1a45"];
const SKIN = ["#f1c7a8", "#c68642", "#8d5524", "#e0ac69", "#5c3a21"];
const SHIRTS = ["#7c3aed", "#ec4899", "#06b6d4", "#f59e0b", "#10b981", "#6366f1"];

function person(x: number, y: number, opts: { skin?: number; shirt?: number; scale?: number; armUp?: boolean; flip?: boolean; sit?: boolean } = {}) {
  const s = opts.scale ?? 1;
  const skin = SKIN[(opts.skin ?? 0) % SKIN.length];
  const shirt = SHIRTS[(opts.shirt ?? 0) % SHIRTS.length];
  const flip = opts.flip ? -1 : 1;
  const arm = opts.armUp
    ? `<path d="M ${34 * flip} 150 Q ${70 * flip} 120 ${80 * flip} 70" stroke="${skin}" stroke-width="22" stroke-linecap="round" fill="none"/>`
    : `<path d="M ${34 * flip} 150 Q ${60 * flip} 190 ${48 * flip} 236" stroke="${skin}" stroke-width="22" stroke-linecap="round" fill="none"/>`;
  const legs = opts.sit
    ? `<rect x="-42" y="250" width="84" height="40" rx="18" fill="#1e1b4b"/>`
    : `<rect x="-38" y="250" width="30" height="110" rx="14" fill="#1e1b4b"/><rect x="8" y="250" width="30" height="110" rx="14" fill="#1e1b4b"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})">
    ${legs}
    <rect x="-46" y="130" width="92" height="135" rx="34" fill="${shirt}"/>
    ${arm}
    <circle cx="0" cy="80" r="46" fill="${skin}"/>
    <path d="M -46 70 Q 0 10 46 70 Q 30 40 0 44 Q -30 40 -46 70 Z" fill="#1e1b4b"/>
    <circle cx="-14" cy="84" r="4" fill="#1e1b4b"/><circle cx="14" cy="84" r="4" fill="#1e1b4b"/>
    <path d="M -12 100 Q 0 112 12 100" stroke="#1e1b4b" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g>`;
}

function bubble(x: number, y: number, w: number, text: string, color = "#ffffff", textColor = "#0f172a", tail: "left" | "right" = "left") {
  const tailPath = tail === "left" ? `M ${x + 30} ${y + 70} l -22 26 l 34 -6 z` : `M ${x + w - 30} ${y + 70} l 22 26 l -34 -6 z`;
  return `<rect x="${x}" y="${y}" width="${w}" height="72" rx="24" fill="${color}"/><path d="${tailPath}" fill="${color}"/><text x="${x + w / 2}" y="${y + 45}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="700" fill="${textColor}">${text}</text>`;
}

function phone(x: number, y: number) {
  return `<g transform="translate(${x},${y})"><rect width="110" height="210" rx="22" fill="#ffffff"/><rect x="10" y="22" width="90" height="166" rx="12" fill="#ede9fe"/><rect x="22" y="40" width="66" height="14" rx="7" fill="#7c3aed"/><rect x="22" y="66" width="66" height="10" rx="5" fill="#c4b5fd"/><rect x="22" y="84" width="48" height="10" rx="5" fill="#c4b5fd"/><rect x="22" y="110" width="66" height="36" rx="10" fill="#7c3aed"/><text x="55" y="134" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" fill="#fff">Send</text></g>`;
}

function laptop(x: number, y: number, screen: string) {
  return `<g transform="translate(${x},${y})"><rect width="300" height="190" rx="16" fill="#ffffff"/><rect x="14" y="14" width="272" height="150" rx="10" fill="#0c0a1d"/>${screen}<rect x="-20" y="190" width="340" height="18" rx="9" fill="#e2e8f0"/></g>`;
}

function dashboardScreen() {
  return `<rect x="30" y="30" width="60" height="36" rx="8" fill="#7c3aed"/><rect x="100" y="30" width="60" height="36" rx="8" fill="#06b6d4"/><rect x="170" y="30" width="60" height="36" rx="8" fill="#ec4899"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${34 + i * 30}" y="${140 - (20 + i * 9)}" width="20" height="${20 + i * 9}" rx="4" fill="#a78bfa"/>`).join("")}`;
}

function frame(inner: string, title: string, subtitle: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BG[0]}"/><stop offset="1" stop-color="${BG[1]}"/></linearGradient>
    <linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#ec4899"/></linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="rgba(255,255,255,0.06)"/></pattern>
  </defs>
  <rect width="1600" height="1200" fill="url(#bg)"/><rect width="1600" height="1200" fill="url(#grid)"/>
  <circle cx="1300" cy="250" r="360" fill="#7c3aed" opacity="0.22"/><circle cx="260" cy="1000" r="300" fill="#ec4899" opacity="0.16"/>
  <rect x="120" y="880" width="1360" height="24" rx="12" fill="rgba(255,255,255,0.08)"/>
  ${inner}
  <rect x="120" y="980" width="140" height="10" rx="5" fill="url(#ac)"/>
  <text x="120" y="1050" font-family="Segoe UI, Arial, sans-serif" font-size="54" font-weight="800" fill="#ffffff">${title}</text>
  <text x="120" y="1100" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="rgba(255,255,255,0.7)">${subtitle}</text>
  <text x="1480" y="1140" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="20" fill="rgba(255,255,255,0.45)">Illustration · Raremedia</text>
</svg>`;
}

export interface Illustration {
  key: string;
  alt: string; // step title
  caption: string; // step description
  svg: string;
}

export const ILLUSTRATIONS: Illustration[] = [
  {
    key: "01-ask",
    alt: "You tell us what you need",
    caption: "Send a message, WhatsApp us or fill in the project request form. A shop owner, a cooperative, a school, a startup — every project starts with a conversation.",
    svg: frame(
      `${person(420, 520, { skin: 1, shirt: 3, armUp: true })}${phone(560, 560)}${bubble(640, 300, 520, "I need a POS for my shop", "#ffffff", "#0f172a", "left")}
       ${person(1180, 520, { skin: 0, shirt: 0, flip: true })}${bubble(760, 430, 420, "Tell us more — we can help!", "#7c3aed", "#ffffff", "right")}`,
      "1. Ask for a service",
      "Message, call or submit a project request — we reply within one business day.",
    ),
  },
  {
    key: "02-plan",
    alt: "We understand your business together",
    caption: "We listen, visit if needed, and map your real process: products, members, bookings, reports. Then we agree on scope, timeline and price.",
    svg: frame(
      `<rect x="360" y="330" width="880" height="420" rx="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)"/>
       <rect x="420" y="390" width="760" height="22" rx="11" fill="#c4b5fd"/><rect x="420" y="440" width="560" height="22" rx="11" fill="rgba(255,255,255,0.35)"/><rect x="420" y="490" width="640" height="22" rx="11" fill="rgba(255,255,255,0.35)"/>
       <rect x="420" y="560" width="200" height="120" rx="18" fill="#7c3aed"/><rect x="650" y="560" width="200" height="120" rx="18" fill="#06b6d4"/><rect x="880" y="560" width="200" height="120" rx="18" fill="#ec4899"/>
       <text x="520" y="630" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="700" fill="#fff">Scope</text><text x="750" y="630" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="700" fill="#fff">Timeline</text><text x="980" y="630" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="700" fill="#fff">Price</text>
       ${person(250, 520, { skin: 2, shirt: 4, armUp: true })}${person(1350, 520, { skin: 3, shirt: 0, flip: true, armUp: true })}`,
      "2. Plan together",
      "Clear scope, timeline and price before any code is written.",
    ),
  },
  {
    key: "03-build",
    alt: "We build and show you progress",
    caption: "You see previews during development and give feedback early. Nothing is a surprise at the end.",
    svg: frame(
      `${laptop(560, 420, dashboardScreen())}${person(380, 540, { skin: 4, shirt: 5, sit: true })}${person(1180, 540, { skin: 1, shirt: 1, flip: true, armUp: true })}
       ${bubble(1000, 300, 420, "Looks great — add receipts?", "#ffffff", "#0f172a", "right")}${bubble(260, 300, 360, "Preview is ready!", "#06b6d4", "#ffffff", "left")}
       <circle cx="1310" cy="760" r="40" fill="#10b981"/><path d="M1290 760 l14 14 l28 -30" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      "3. Build &amp; review",
      "Iterative development with regular previews and your feedback.",
    ),
  },
  {
    key: "04-launch",
    alt: "Launch, training and support",
    caption: "We deploy, train your team and stay with you: updates, fixes and improvements as your business grows.",
    svg: frame(
      `${person(430, 520, { skin: 0, shirt: 2, armUp: true })}${person(620, 520, { skin: 2, shirt: 0, armUp: true })}${person(820, 520, { skin: 3, shirt: 1, armUp: true })}${person(1010, 520, { skin: 1, shirt: 4, armUp: true })}${person(1200, 520, { skin: 4, shirt: 3, armUp: true })}
       ${[0, 1, 2, 3, 4].map((i) => `<path transform="translate(${520 + i * 160},${260 + (i % 2) * 40}) scale(1.6)" d="M0 -20 L6 -6 L20 -4 L10 6 L12 20 L0 13 L-12 20 L-10 6 L-20 -4 L-6 -6 Z" fill="#fbbf24"/>`).join("")}
       <rect x="560" y="800" width="480" height="60" rx="30" fill="url(#ac)"/><text x="800" y="840" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="800" fill="#fff">System live!</text>`,
      "4. Launch &amp; long-term support",
      "Deployment, training and ongoing support for your team.",
    ),
  },
  {
    key: "05-happy",
    alt: "A partner for the long term",
    caption: "Clients come back for the next website, system or AI tool. We grow with your business.",
    svg: frame(
      `${person(520, 520, { skin: 1, shirt: 0, armUp: true })}${person(760, 520, { skin: 3, shirt: 1, flip: true, armUp: true })}
       ${bubble(300, 300, 440, "Stock is finally under control!", "#ffffff", "#0f172a", "left")}${bubble(820, 300, 460, "Members trust the reports now.", "#ffffff", "#0f172a", "right")}
       ${laptop(980, 450, dashboardScreen())}
       <text x="800" y="860" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700" fill="#c4b5fd">Websites → Business Systems → Advanced Platforms → AI</text>`,
      "5. Grow together",
      "From a first website to advanced platforms and AI-powered tools.",
    ),
  },
];

// ------------------------------------------------------------------
// Sector scenes: what a project is used for (a classroom, a shop counter,
// a savings-group meeting...). Stylised vector illustrations, stored with
// source "ILLUSTRATION" so the site never presents them as photographs of
// real customers or locations.
// ------------------------------------------------------------------

const T = 'font-family="Segoe UI, Arial, sans-serif"';
const desk = (x: number, y: number, w: number) => `<rect x="${x}" y="${y}" width="${w}" height="26" rx="10" fill="#e2e8f0"/><rect x="${x + 30}" y="${y + 26}" width="18" height="110" fill="#94a3b8"/><rect x="${x + w - 48}" y="${y + 26}" width="18" height="110" fill="#94a3b8"/>`;
const board = (x: number, y: number, w: number, h: number, lines: string[]) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#134e4a" stroke="#e2e8f0" stroke-width="8"/>${lines.map((l, i) => `<text x="${x + 36}" y="${y + 64 + i * 50}" ${T} font-size="34" font-weight="700" fill="#ecfeff">${l}</text>`).join("")}`;
const shelf = (x: number, y: number) =>
  `<rect x="${x}" y="${y}" width="330" height="330" rx="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)"/>${[0, 1, 2].map((r) => `<rect x="${x}" y="${y + 100 + r * 105}" width="330" height="10" fill="#94a3b8"/>${[0, 1, 2, 3, 4].map((c) => `<rect x="${x + 22 + c * 60}" y="${y + 36 + r * 105}" width="42" height="64" rx="8" fill="${SHIRTS[(r + c) % SHIRTS.length]}"/>`).join("")}`).join("")}`;
const till = (x: number, y: number) =>
  `<rect x="${x}" y="${y}" width="190" height="130" rx="14" fill="#ffffff"/><rect x="${x + 14}" y="${y + 14}" width="162" height="70" rx="8" fill="#0c0a1d"/><text x="${x + 95}" y="${y + 60}" text-anchor="middle" ${T} font-size="26" font-weight="800" fill="#22d3ee">13,100</text><rect x="${x + 60}" y="${y - 70}" width="70" height="80" fill="#f8fafc"/>${[0, 1, 2].map((i) => `<rect x="${x + 70}" y="${y - 58 + i * 18}" width="50" height="6" rx="3" fill="#94a3b8"/>`).join("")}`;
const car = (x: number, y: number, color: string) =>
  `<g transform="translate(${x},${y})"><path d="M0 90 Q10 40 70 36 L120 0 H250 Q290 4 320 40 L380 52 Q410 60 410 96 V120 H0 Z" fill="${color}"/><path d="M132 14 H190 V46 H96 Z M204 14 H246 Q270 18 292 46 H204 Z" fill="#cffafe"/><circle cx="92" cy="122" r="38" fill="#0f172a"/><circle cx="92" cy="122" r="16" fill="#cbd5e1"/><circle cx="318" cy="122" r="38" fill="#0f172a"/><circle cx="318" cy="122" r="16" fill="#cbd5e1"/></g>`;
const moto = (x: number, y: number) =>
  `<g transform="translate(${x},${y})"><circle cx="40" cy="110" r="40" fill="#0f172a"/><circle cx="40" cy="110" r="14" fill="#cbd5e1"/><circle cx="230" cy="110" r="40" fill="#0f172a"/><circle cx="230" cy="110" r="14" fill="#cbd5e1"/><path d="M40 110 L100 50 H180 L230 110" stroke="#f59e0b" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="92" y="30" width="96" height="24" rx="12" fill="#1e1b4b"/><path d="M180 50 L206 6 H236" stroke="#e2e8f0" stroke-width="10" fill="none" stroke-linecap="round"/></g>`;
const paper = (x: number, y: number, title: string) =>
  `<rect x="${x}" y="${y}" width="210" height="270" rx="12" fill="#ffffff"/><text x="${x + 22}" y="${y + 46}" ${T} font-size="24" font-weight="800" fill="#0f766e">${title}</text>${[0, 1, 2, 3, 4].map((i) => `<rect x="${x + 22}" y="${y + 74 + i * 34}" width="${i % 2 ? 130 : 166}" height="12" rx="6" fill="#cbd5e1"/>`).join("")}<circle cx="${x + 170}" cy="${y + 234}" r="18" fill="#10b981"/>`;
const coins = (x: number, y: number) => [0, 1, 2, 3].map((i) => `<ellipse cx="${x}" cy="${y - i * 16}" rx="46" ry="16" fill="#fbbf24" stroke="#b45309" stroke-width="4"/>`).join("");

export const SECTOR_SCENES: Record<string, { alt: string; caption: string; svg: string }> = {
  classroom: {
    alt: "Illustration of a computer training class with a trainer and learners at laptops",
    caption: "Illustration: a computer training session, where learners earn the certificates this system issues.",
    svg: frame(
      `${board(520, 250, 560, 230, ["Computer Basics", "Lesson 4: Spreadsheets"])}${person(330, 400, { skin: 2, shirt: 0, armUp: true })}
       ${desk(200, 760, 1200)}${[0, 1, 2].map((i) => `${person(470 + i * 330, 560, { skin: i + 1, shirt: i + 2, sit: true, scale: 0.9 })}${laptop(360 + i * 330, 650, dashboardScreen()).replace('<g transform="translate', '<g opacity="0.98" transform="translate')}`).join("")}`,
      "Training &amp; certificates",
      "Learners follow a course, pass it and receive a verifiable certificate.",
    ),
  },
  shop: {
    alt: "Illustration of a cashier serving a customer at a shop counter with a point-of-sale terminal",
    caption: "Illustration: a shop counter with a POS terminal, product shelves and a printed receipt.",
    svg: frame(
      `${shelf(150, 300)}${shelf(1120, 300)}${person(560, 440, { skin: 1, shirt: 2 })}${person(980, 440, { skin: 3, shirt: 1, flip: true, armUp: true })}
       <rect x="470" y="700" width="680" height="170" rx="18" fill="#1e1b4b" stroke="rgba(255,255,255,0.2)"/>${till(700, 580)}${bubble(900, 250, 360, "Receipt, please!", "#ffffff", "#0f172a", "right")}`,
      "Sales at the counter",
      "Every sale updates stock and prints a receipt in seconds.",
    ),
  },
  restaurant: {
    alt: "Illustration of a waiter taking an order from two guests at a restaurant table",
    caption: "Illustration: a waiter taking an order at the table; the bill and receipt follow from the same screen.",
    svg: frame(
      `${person(360, 430, { skin: 4, shirt: 3, armUp: true })}${phone(430, 420)}
       ${person(820, 520, { skin: 0, shirt: 1, sit: true })}${person(1180, 520, { skin: 2, shirt: 4, sit: true, flip: true })}
       <ellipse cx="1000" cy="790" rx="330" ry="46" fill="#e2e8f0"/><rect x="985" y="820" width="30" height="60" fill="#94a3b8"/>
       <circle cx="900" cy="770" r="38" fill="#ffffff"/><circle cx="900" cy="770" r="22" fill="#f59e0b"/><circle cx="1100" cy="770" r="38" fill="#ffffff"/><circle cx="1100" cy="770" r="22" fill="#10b981"/><rect x="985" y="716" width="30" height="56" rx="8" fill="#22d3ee"/>
       ${bubble(520, 260, 400, "Table 3: two brochettes", "#ffffff", "#0f172a", "left")}`,
      "Orders at the table",
      "Tables, orders, bills and receipts for a restaurant and bar.",
    ),
  },
  transport: {
    alt: "Illustration of a car and a motorcycle taxi with a passenger booking a trip on a phone",
    caption: "Illustration: a passenger booking a trip, with a car and a motorcycle available on the route.",
    svg: frame(
      `<path d="M120 860 H1480" stroke="#475569" stroke-width="60"/><path d="M140 860 H1480" stroke="#e2e8f0" stroke-width="6" stroke-dasharray="50 40"/>
       <path d="M420 330 Q700 200 900 340 T1300 300" stroke="#22d3ee" stroke-width="10" fill="none" stroke-dasharray="18 14"/><circle cx="420" cy="330" r="22" fill="#10b981"/><circle cx="1300" cy="300" r="22" fill="#ef4444"/>
       ${person(300, 470, { skin: 1, shirt: 5, armUp: true })}${phone(370, 430)}${car(620, 690, "#2563eb")}${moto(1120, 720)}${person(1250, 545, { skin: 3, shirt: 3, sit: true, scale: 0.8 })}`,
      "Trips on demand",
      "Book a car or a motorcycle and follow the trip from pick-up to arrival.",
    ),
  },
  ikimina: {
    alt: "Illustration of savings-group members at a meeting recording contributions on a laptop",
    caption: "Illustration: members of a savings group at their meeting while the treasurer records contributions.",
    svg: frame(
      `${[0, 1, 2, 3, 4].map((i) => person(300 + i * 250, 430 + (i % 2) * 40, { skin: i, shirt: i + 1, armUp: i === 2, flip: i > 2 })).join("")}
       ${desk(430, 790, 740)}${laptop(650, 590, dashboardScreen())}${coins(520, 780)}${coins(1090, 780)}
       ${bubble(880, 250, 420, "20,000 RWF received", "#7c3aed", "#ffffff", "right")}`,
      "Saving together",
      "Members, contributions, loans and repayments recorded in front of everyone.",
    ),
  },
  audit: {
    alt: "Illustration of two auditors reviewing working papers and a financial dashboard in an office",
    caption: "Illustration: auditors reviewing indexed working papers next to a financial dashboard.",
    svg: frame(
      `${paper(190, 330, "A-2")}${paper(430, 300, "C-1")}${laptop(820, 470, dashboardScreen())}${desk(700, 690, 560)}
       ${person(760, 470, { skin: 0, shirt: 4, sit: true })}${person(1300, 470, { skin: 4, shirt: 0, flip: true, armUp: true })}
       ${bubble(960, 250, 380, "C-1 reviewed", "#ffffff", "#0f172a", "right")}`,
      "Audit files in order",
      "Every working paper indexed, prepared, reviewed and signed off.",
    ),
  },
};

export async function renderIllustration(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).png().toBuffer();
}
