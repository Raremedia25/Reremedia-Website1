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

export async function renderIllustration(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).png().toBuffer();
}
