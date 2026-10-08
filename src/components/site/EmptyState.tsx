import Link from "next/link";
import { Inbox } from "lucide-react";

export function EmptyState({ title, description, actionLabel, actionHref }: { title: string; description?: string; actionLabel?: string; actionHref?: string }) {
  return (
    <div className="card mx-auto max-w-lg p-10 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <Inbox className="h-6 w-6" />
      </span>
      <h3 className="font-display mt-4 text-lg font-bold text-ink-900">{title}</h3>
      {description && <p className="mt-2 text-sm text-ink-500">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn btn-secondary btn-sm mt-5">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
