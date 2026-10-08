import { deleteTestimonialAction } from "@/actions/testimonials";
import { ConfirmButton } from "@/components/admin/forms";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { EmptyRow, PageHeader, Panel, StatusBadge, Table, Td, Th } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { toMediaDTO } from "@/lib/media/dto";
import { truncate } from "@/lib/utils";

export default async function AdminTestimonialsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  await requirePermission("testimonials:manage");
  const { edit } = await searchParams;
  const [items, projects] = await Promise.all([
    prisma.testimonial.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }], include: { photo: true, project: { select: { title: true } } } }),
    prisma.project.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);
  const editing = edit ? items.find((t) => t.id === edit) : null;

  return (
    <>
      <PageHeader title="Testimonials" description="Real feedback from clients. Only add quotes you have permission to publish. Published testimonials appear on the homepage and About page." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Table minWidthClass="min-w-[480px]" className="self-start">
          <thead>
            <tr>
              <Th>Client</Th>
              <Th>Quote</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <EmptyRow colSpan={3} message="No testimonials yet. Add the first one using the form." />
            ) : (
              items.map((t) => (
                <tr key={t.id} className="hover:bg-ink-50/60">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-ink-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {t.photo && <img src={toMediaDTO(t.photo).thumbUrl} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="whitespace-nowrap font-semibold text-ink-900">{t.name}</p>
                        <p className="whitespace-nowrap text-xs text-ink-500">{[t.role, t.company].filter(Boolean).join(" · ")}</p>
                        <p className="text-xs leading-none text-amber-500" aria-label={`${t.rating} out of 5 stars`}>
                          {"★".repeat(t.rating)}
                          <span className="text-ink-200">{"★".repeat(5 - t.rating)}</span>
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-ink-700">
                    <p className="line-clamp-2">{truncate(t.quote, 140)}</p>
                    <div className="mt-1.5">
                      <StatusBadge value={t.isPublished ? "PUBLISHED" : "DRAFT"} label={t.isPublished ? "Published" : "Hidden"} />
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      <a href={`/admin/testimonials?edit=${t.id}`} className="btn btn-secondary btn-sm">
                        Edit
                      </a>
                      <ConfirmButton action={deleteTestimonialAction} hiddenFields={{ id: t.id }} label="" />
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
        <Panel title={editing ? `Edit testimonial` : "Add testimonial"} className="lg:sticky lg:top-24 lg:self-start">
          <TestimonialForm
            key={editing?.id ?? "new"}
            projects={projects}
            values={
              editing
                ? { id: editing.id, name: editing.name, role: editing.role ?? "", company: editing.company ?? "", quote: editing.quote, rating: editing.rating, projectId: editing.projectId ?? "", isPublished: editing.isPublished, order: editing.order, photo: editing.photo ? toMediaDTO(editing.photo) : null }
                : { name: "", role: "", company: "", quote: "", rating: 5, projectId: "", isPublished: true, order: 0, photo: null }
            }
          />
        </Panel>
      </div>
    </>
  );
}
