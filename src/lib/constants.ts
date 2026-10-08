// Shared constants: roles, permissions, statuses and option lists.
// Enum-like values are plain strings so the schema stays portable
// between SQLite and PostgreSQL.

export const ROLES = ["SUPER_ADMIN", "CONTENT_MANAGER", "PROJECT_MANAGER", "VIEWER"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  CONTENT_MANAGER: "Content Manager",
  PROJECT_MANAGER: "Project Manager",
  VIEWER: "Viewer",
};

export const PERMISSIONS = [
  "dashboard:view",
  "projects:manage",
  "posts:manage",
  "testimonials:manage",
  "media:manage",
  "services:manage",
  "categories:manage",
  "messages:manage",
  "requests:manage",
  "users:manage",
  "settings:manage",
  "analytics:view",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: PERMISSIONS,
  CONTENT_MANAGER: [
    "dashboard:view",
    "projects:manage",
    "posts:manage",
    "testimonials:manage",
    "media:manage",
    "services:manage",
    "categories:manage",
    "messages:manage",
    "requests:manage",
    "analytics:view",
  ],
  PROJECT_MANAGER: ["dashboard:view", "projects:manage", "media:manage", "requests:manage", "analytics:view"],
  VIEWER: ["dashboard:view", "analytics:view"],
};

export const PUBLISH_STATUSES = ["DRAFT", "PUBLISHED", "SCHEDULED"] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const PROJECT_STATUSES = ["PLANNED", "IN_PROGRESS", "COMPLETED", "RESEARCH"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  RESEARCH: "R&D / Upcoming",
};

export const POST_TYPES = ["ARTICLE", "UPDATE", "ANNOUNCEMENT", "TUTORIAL", "CASE_STUDY", "NEWS", "PROMOTION"] as const;
export type PostType = (typeof POST_TYPES)[number];
export const POST_TYPE_LABELS: Record<PostType, string> = {
  ARTICLE: "Article",
  UPDATE: "Company update",
  ANNOUNCEMENT: "Announcement",
  TUTORIAL: "Tutorial",
  CASE_STUDY: "Case study",
  NEWS: "News",
  PROMOTION: "Promotion",
};

export const MESSAGE_STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"] as const;
export const REQUEST_STATUSES = ["NEW", "REVIEWING", "QUOTED", "ACCEPTED", "DECLINED", "ARCHIVED"] as const;

export const PROJECT_TYPES = [
  "Website",
  "Mobile App",
  "Desktop System",
  "POS",
  "Management System",
  "Booking Platform",
  "E-commerce",
  "AI Application",
  "Social Platform",
  "Custom Software",
] as const;

export const BUDGET_RANGES = [
  "Under 500,000 RWF",
  "500,000 – 1,500,000 RWF",
  "1,500,000 – 5,000,000 RWF",
  "5,000,000 – 15,000,000 RWF",
  "Over 15,000,000 RWF",
  "Not sure yet",
] as const;

export const CATEGORY_TYPES = ["project", "post"] as const;

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ATTACHMENT_MIME_TYPES = [...IMAGE_MIME_TYPES, "application/pdf"] as const;

export const IMAGE_VARIANT_WIDTHS = [480, 960, 1440, 1920] as const;

export const SESSION_COOKIE = "raremedia_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
