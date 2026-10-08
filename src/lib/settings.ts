import { cache } from "react";
import { prisma } from "@/lib/db";

export const SETTING_KEYS = {
  siteTagline: "site.tagline",
  siteDescription: "site.description",
  socialLinkedin: "social.linkedin",
  socialX: "social.x",
  socialInstagram: "social.instagram",
  socialFacebook: "social.facebook",
  socialYoutube: "social.youtube",
  socialGithub: "social.github",
  socialWhatsapp: "social.whatsapp",
  footerNote: "site.footerNote",
  announcement: "site.announcement",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export const SETTING_FIELDS: Array<{ key: SettingKey; label: string; placeholder?: string; type?: "text" | "url" | "textarea" }> = [
  { key: SETTING_KEYS.siteTagline, label: "Site tagline", placeholder: "Digital solutions built for modern businesses." },
  { key: SETTING_KEYS.siteDescription, label: "Site description (SEO default)", type: "textarea" },
  { key: SETTING_KEYS.announcement, label: "Announcement bar (leave empty to hide)", placeholder: "We are accepting new projects for this quarter." },
  { key: SETTING_KEYS.socialLinkedin, label: "LinkedIn URL", type: "url" },
  { key: SETTING_KEYS.socialX, label: "X (Twitter) URL", type: "url" },
  { key: SETTING_KEYS.socialInstagram, label: "Instagram URL", type: "url" },
  { key: SETTING_KEYS.socialFacebook, label: "Facebook URL", type: "url" },
  { key: SETTING_KEYS.socialYoutube, label: "YouTube URL", type: "url" },
  { key: SETTING_KEYS.socialGithub, label: "GitHub URL", type: "url" },
  { key: SETTING_KEYS.socialWhatsapp, label: "WhatsApp link", type: "url", placeholder: "https://wa.me/250781425110" },
  { key: SETTING_KEYS.footerNote, label: "Footer note", placeholder: "Built in Rwanda." },
];

export type SettingsMap = Record<string, string>;

export const getSettings = cache(async (): Promise<SettingsMap> => {
  try {
    const rows = await prisma.siteSetting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
});

export function socialLinks(settings: SettingsMap) {
  const entries: Array<{ id: string; label: string; url: string }> = [
    { id: "linkedin", label: "LinkedIn", url: settings[SETTING_KEYS.socialLinkedin] },
    { id: "x", label: "X", url: settings[SETTING_KEYS.socialX] },
    { id: "instagram", label: "Instagram", url: settings[SETTING_KEYS.socialInstagram] },
    { id: "facebook", label: "Facebook", url: settings[SETTING_KEYS.socialFacebook] },
    { id: "youtube", label: "YouTube", url: settings[SETTING_KEYS.socialYoutube] },
    { id: "github", label: "GitHub", url: settings[SETTING_KEYS.socialGithub] },
    { id: "whatsapp", label: "WhatsApp", url: settings[SETTING_KEYS.socialWhatsapp] },
  ];
  return entries.filter((e) => e.url && /^https?:\/\//i.test(e.url));
}

export async function saveSettings(values: Record<string, string>) {
  const allowed = new Set<string>(Object.values(SETTING_KEYS));
  const ops = Object.entries(values)
    .filter(([k]) => allowed.has(k))
    .map(([key, value]) =>
      prisma.siteSetting.upsert({ where: { key }, update: { value: value.trim() }, create: { key, value: value.trim() } }),
    );
  await prisma.$transaction(ops);
}
