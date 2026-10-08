import { z } from "zod";
import {
  BUDGET_RANGES,
  CATEGORY_TYPES,
  MESSAGE_STATUSES,
  POST_TYPES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  PUBLISH_STATUSES,
  REQUEST_STATUSES,
  ROLES,
} from "./constants";

const trimmed = (max: number, min = 0) =>
  z
    .string({ message: "This field is required" })
    .trim()
    .min(min, min > 0 ? (min === 1 ? "This field is required" : `Please enter at least ${min} characters`) : undefined)
    .max(max, `Please keep this under ${max} characters`);
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https?:\/\/[^\s]+$/i.test(v), { message: "Must be a valid http(s) URL" });
const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? new Date(v) : null))
  .refine((v) => v === null || !Number.isNaN(v.getTime()), { message: "Invalid date" });
const listField = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean),
  );
const emailField = z.string({ message: "Email is required" }).trim().toLowerCase().email("Enter a valid email address").max(160);
const phoneField = z
  .string()
  .trim()
  .max(40)
  .refine((v) => v === "" || /^[+\d][\d\s()-]{6,}$/.test(v), { message: "Enter a valid phone number" });

// -------------------------------------------------------------- public

export const contactSchema = z.object({
  name: trimmed(120, 2),
  email: emailField,
  phone: phoneField.optional().default(""),
  subject: trimmed(160, 2),
  message: trimmed(5000, 10),
  website: z.string().optional(), // honeypot (checked before validation)
});

export const projectRequestSchema = z.object({
  fullName: trimmed(120, 2),
  company: trimmed(160).optional().default(""),
  email: emailField,
  phone: phoneField.refine((v) => v.length > 0, { message: "Phone is required" }),
  projectType: z.enum(PROJECT_TYPES, { message: "Choose a project type" }),
  budgetRange: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((v) => v === "" || (BUDGET_RANGES as readonly string[]).includes(v), { message: "Choose a budget range from the list" }),
  description: trimmed(6000, 20),
  features: trimmed(4000).optional().default(""),
  deadline: trimmed(120).optional().default(""),
  referenceLinks: trimmed(2000).optional().default(""),
  website: z.string().optional(), // honeypot (checked before validation)
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

// --------------------------------------------------------------- admin

export const projectSchema = z.object({
  title: trimmed(160, 3),
  slug: trimmed(120).optional().default(""),
  summary: trimmed(400, 10),
  content: z.string().max(60000).optional().default(""),
  categoryId: z.string().trim().optional().transform((v) => v || null),
  projectStatus: z.enum(PROJECT_STATUSES),
  publishStatus: z.enum(PUBLISH_STATUSES),
  scheduledAt: optionalDate,
  clientType: trimmed(160).optional().transform((v) => v || null),
  completedAt: optionalDate,
  demoUrl: optionalUrl,
  githubUrl: optionalUrl,
  features: listField,
  technologies: listField,
  featuredImageId: z.string().trim().optional().transform((v) => v || null),
  isFeatured: z.coerce.boolean().optional().default(false),
  order: z.coerce.number().int().min(0).max(10000).optional().default(0),
  seoTitle: trimmed(160).optional().transform((v) => v || null),
  seoDescription: trimmed(320).optional().transform((v) => v || null),
});

export const postSchema = z.object({
  title: trimmed(160, 3),
  slug: trimmed(120).optional().default(""),
  excerpt: trimmed(400, 10),
  content: z.string().max(80000).optional().default(""),
  type: z.enum(POST_TYPES),
  categoryId: z.string().trim().optional().transform((v) => v || null),
  tags: z
    .string()
    .optional()
    .transform((v) =>
      (v ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  featuredImageId: z.string().trim().optional().transform((v) => v || null),
  publishStatus: z.enum(PUBLISH_STATUSES),
  scheduledAt: optionalDate,
  publishedAt: optionalDate,
  seoTitle: trimmed(160).optional().transform((v) => v || null),
  seoDescription: trimmed(320).optional().transform((v) => v || null),
});

export const serviceSchema = z.object({
  name: trimmed(120, 3),
  slug: trimmed(120).optional().default(""),
  icon: trimmed(40).optional().default("code"),
  summary: trimmed(300, 10),
  description: z.string().max(10000).optional().default(""),
  items: listField,
  order: z.coerce.number().int().min(0).max(10000).optional().default(0),
  isPublished: z.coerce.boolean().optional().default(false), // unchecked checkbox sends nothing
});

export const categorySchema = z.object({
  name: trimmed(80, 2),
  slug: trimmed(80).optional().default(""),
  type: z.enum(CATEGORY_TYPES),
  description: trimmed(300).optional().default(""),
  color: trimmed(20).optional().default(""),
  order: z.coerce.number().int().min(0).max(10000).optional().default(0),
});

export const userSchema = z.object({
  name: trimmed(120, 2),
  email: emailField,
  role: z.enum(ROLES),
  password: z.string().min(8, "Password must be at least 8 characters").max(200).optional().or(z.literal("")),
  isActive: z.coerce.boolean().optional().default(false), // unchecked checkbox sends nothing
});

export const testimonialSchema = z.object({
  name: trimmed(120, 2),
  role: trimmed(120).optional().default(""),
  company: trimmed(160).optional().default(""),
  quote: trimmed(1200, 10),
  rating: z.coerce.number().int().min(1).max(5).optional().default(5),
  photoId: z.string().trim().optional().transform((val) => val || null),
  projectId: z.string().trim().optional().transform((val) => val || null),
  isPublished: z.coerce.boolean().optional().default(false),
  order: z.coerce.number().int().min(0).max(10000).optional().default(0),
});

export const mediaUpdateSchema = z.object({
  alt: trimmed(300).optional().default(""),
  caption: trimmed(500).optional().default(""),
  folder: trimmed(60).optional().default("general"),
});

export const messageStatusSchema = z.enum(MESSAGE_STATUSES);
export const requestStatusSchema = z.enum(REQUEST_STATUSES);

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Password must be at least 8 characters").max(200),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export type FieldErrors = Record<string, string>;

export function flattenErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? String(issue.path[0]) : "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function formDataToObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}
