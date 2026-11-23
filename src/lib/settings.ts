import { cache } from "react";
import { prisma } from "@/lib/db";

import { SETTING_KEYS, type SettingsMap } from "./settings-fields";

export { SETTING_FIELDS, SETTING_KEYS, type SettingKey, type SettingsMap } from "./settings-fields";

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
