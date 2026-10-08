import { notFound } from "next/navigation";
import { Mail, Paperclip, Phone } from "lucide-react";
import { deleteRequestAction, updateRequestAction } from "@/actions/inbox";
import { ConfirmButton, SubmitButton } from "@/components/admin/forms";
import { PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { REQUEST_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDateTime, whatsappLink } from "@/lib/utils";

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("requests:manage");
  const { id } = await params;
  const r = await prisma.projectRequest.findUnique({ where: { id }, include: { attachment: true } });
  if (!r) notFound();
  if (r.status === "NEW") {
    await prisma.projectRequest.update({ where: { id }, data: { status: "REVIEWING" } });
    r.status = "REVIEWING";
  }
  const reference = `RR-${r.id.slice(-6).toUpperCase()}`;

  return (
    <>
      <PageHeader title={`${r.projectType} · ${reference}`} description={`Submitted ${formatDateTime(r.createdAt)}`} backHref="/admin/requests" actions={<ConfirmButton action={deleteRequestAction} hiddenFields={{ id: r.id }} label="Delete" />} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Panel title="Project description">
            <p className="whitespace-pre-wrap leading-relaxed text-ink-800">{r.description}</p>
          </Panel>
          {r.features && (
            <Panel title="Required features">
              <p className="whitespace-pre-wrap leading-relaxed text-ink-800">{r.features}</p>
            </Panel>
          )}
          <Panel title="Other details">
            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-ink-500">Budget range</dt>
                <dd className="font-medium text-ink-900">{r.budgetRange ?? "Not specified"}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Preferred deadline</dt>
                <dd className="font-medium text-ink-900">{r.deadline ?? "Not specified"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-ink-500">Reference links</dt>
                <dd className="font-medium text-ink-900 break-words">
                  {r.referenceLinks
                    ? r.referenceLinks.split(/[\s,]+/).filter(Boolean).map((l) => (
                        <a key={l} href={/^https?:\/\//.test(l) ? l : `https://${l}`} target="_blank" rel="noopener noreferrer" className="block text-brand-700 hover:underline">
                          {l}
                        </a>
                      ))
                    : "None"}
                </dd>
              </div>
              {r.attachment && (
                <div className="sm:col-span-2">
                  <dt className="text-ink-500">Attachment</dt>
                  <dd>
                    <a href={r.attachment.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-700 hover:underline">
                      <Paperclip className="h-4 w-4" /> {r.attachment.originalName}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel title="Client">
            <p className="font-semibold text-ink-900">{r.fullName}</p>
            {r.company && <p className="text-sm text-ink-500">{r.company}</p>}
            <a href={`mailto:${r.email}?subject=Your project request ${reference} — Raremedia`} className="mt-3 flex items-center gap-2 text-sm text-brand-700 hover:underline">
              <Mail className="h-4 w-4" /> {r.email}
            </a>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
              <a href={`tel:${r.phone}`} className="flex items-center gap-2 text-brand-700 hover:underline">
                <Phone className="h-4 w-4" /> {r.phone}
              </a>
              <a href={whatsappLink(r.phone, `Hello ${r.fullName}, this is Raremedia regarding your project request ${reference}.`)} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">
                WhatsApp
              </a>
            </div>
            <a href={`mailto:${r.email}?subject=Your project request ${reference} — Raremedia`} className="btn btn-primary btn-sm mt-4 w-full">
              Reply by email
            </a>
          </Panel>
          <Panel title="Status & notes">
            <div className="mb-3">
              <StatusBadge value={r.status} />
            </div>
            <form action={updateRequestAction} className="space-y-3">
              <input type="hidden" name="id" value={r.id} />
              <select name="status" defaultValue={r.status} className="input">
                {REQUEST_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <textarea name="adminNotes" defaultValue={r.adminNotes ?? ""} className="input min-h-28" placeholder="Internal notes (not visible to the client)" maxLength={5000} />
              <SubmitButton className="btn-sm w-full" pendingText="Saving…">
                Save
              </SubmitButton>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
