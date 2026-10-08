import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { deleteMessageAction, setMessageStatusAction } from "@/actions/inbox";
import { ConfirmButton } from "@/components/admin/forms";
import { PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { MESSAGE_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDateTime, whatsappLink } from "@/lib/utils";

export default async function MessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("messages:manage");
  const { id } = await params;
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) notFound();
  if (message.status === "NEW") {
    await prisma.contactMessage.update({ where: { id }, data: { status: "READ" } });
    message.status = "READ";
  }
  return (
    <>
      <PageHeader title={message.subject} description={`Received ${formatDateTime(message.createdAt)}`} backHref="/admin/messages" actions={<ConfirmButton action={deleteMessageAction} hiddenFields={{ id: message.id }} label="Delete" />} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Panel>
          <p className="whitespace-pre-wrap text-ink-800 leading-relaxed">{message.message}</p>
        </Panel>
        <div className="space-y-4">
          <Panel title="Sender">
            <p className="font-semibold text-ink-900">{message.name}</p>
            <a href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`} className="mt-2 flex items-center gap-2 text-sm text-brand-700 hover:underline">
              <Mail className="h-4 w-4" /> {message.email}
            </a>
            {message.phone && (
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                <a href={`tel:${message.phone}`} className="flex items-center gap-2 text-brand-700 hover:underline">
                  <Phone className="h-4 w-4" /> {message.phone}
                </a>
                <a href={whatsappLink(message.phone)} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">
                  WhatsApp
                </a>
              </div>
            )}
            <a href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`} className="btn btn-primary btn-sm mt-4 w-full">
              Reply by email
            </a>
          </Panel>
          <Panel title="Status">
            <div className="mb-3">
              <StatusBadge value={message.status} />
            </div>
            <form action={setMessageStatusAction} className="flex gap-2">
              <input type="hidden" name="id" value={message.id} />
              <select name="status" defaultValue={message.status} className="input">
                {MESSAGE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <button className="btn btn-secondary btn-sm">Update</button>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
