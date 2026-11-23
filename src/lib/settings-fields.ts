// Setting keys and form fields. Kept free of server imports so client
// components (the admin settings form) can use them.
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
