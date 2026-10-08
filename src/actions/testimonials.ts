"use server";

import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { assertPermission } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { actionError, revalidatePublic, type ActionState } from "@/lib/actions-shared";
import { flattenErrors, formDataToObject, testimonialSchema } from "@/lib/validation";

export async function saveTestimonialAction(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await assertPermission("testimonials:manage");
    const parsed = testimonialSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { error: "Please check the highlighted fields.", errors: flattenErrors(parsed.error) };
    const d = parsed.data;
    const payload = { name: d.name, role: d.role || null, company: d.company || null, quote: d.quote, rating: d.rating, photoId: d.photoId, projectId: d.projectId, isPublished: d.isPublished, order: d.order };
    const saved = id ? await prisma.testimonial.update({ where: { id }, data: payload }) : await prisma.testimonial.create({ data: payload });
    await audit(user, id ? "testimonial.update" : "testimonial.create", "testimonial", saved.id, { name: saved.name, isPublished: saved.isPublished });
    revalidatePublic("all");
    revalidatePath("/about");
    revalidatePath("/admin/testimonials");
    return { success: id ? "Testimonial updated." : "Testimonial created.", id: saved.id };
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteTestimonialAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const user = await assertPermission("testimonials:manage");
  if (!id) return;
  const t = await prisma.testimonial.findUnique({ where: { id }, select: { name: true } });
  if (!t) return;
  await prisma.testimonial.delete({ where: { id } });
  await audit(user, "testimonial.delete", "testimonial", id, { name: t.name });
  revalidatePublic("all");
  revalidatePath("/about");
  revalidatePath("/admin/testimonials");
}
