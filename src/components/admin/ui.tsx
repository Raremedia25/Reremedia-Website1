import Link from "next/link";
import { cn, statusLabel } from "@/lib/utils";

/* ------------------------------------------------------- Page header */
export function PageHeader({ title, description, actions, backHref }: { title: string; description?: string; actions?: React.ReactNode; backHref?: string }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        {backHref && (
          <Link href={backHref} className="text-xs font-semibold text-brand-700 hover:underline">
            ← Back
          </Link>
        )}
        <h1 className="font-display text-2xl font-bold text-ink-900 md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* -------------------------------------------------------------- Card */
export function Panel({ title, description, children, className, actions }: { title?: string; description?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("card p-5 md:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

/* ------------------------------------------------------ Status badge */
const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-ink-100 text-ink-700",
  SCHEDULED: "bg-sky-50 text-sky-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  PLANNED: "bg-ink-100 text-ink-700",
  RESEARCH: "bg-brand-50 text-brand-700",
  NEW: "bg-accent-500/10 text-accent-600",
  READ: "bg-ink-100 text-ink-700",
  REPLIED: "bg-emerald-50 text-emerald-700",
  REVIEWING: "bg-sky-50 text-sky-700",
  QUOTED: "bg-brand-50 text-brand-700",
  ACCEPTED: "bg-emerald-50 text-emerald-700",
  DECLINED: "bg-red-50 text-red-700",
  ARCHIVED: "bg-ink-100 text-ink-500",
  SUPER_ADMIN: "bg-brand-50 text-brand-700",
  CONTENT_MANAGER: "bg-sky-50 text-sky-700",
  PROJECT_MANAGER: "bg-amber-50 text-amber-700",
  VIEWER: "bg-ink-100 text-ink-700",
};

export function StatusBadge({ value, label }: { value: string; label?: string }) {
  return <span className={cn("chip", STATUS_STYLES[value] ?? "bg-ink-100 text-ink-700")}>{label ?? statusLabel(value)}</span>;
}

/* --------------------------------------------------------- Stat card */
export function StatCard({ label, value, hint, href, accent = false }: { label: string; value: number | string; hint?: string; href?: string; accent?: boolean }) {
  const inner = (
    <div className={cn("card p-5 h-full", accent && "gradient-brand text-white border-transparent", href && "card-hover")}>
      <p className={cn("text-xs font-semibold uppercase tracking-wider", accent ? "text-white/80" : "text-ink-500")}>{label}</p>
      <p className={cn("font-display mt-2 text-3xl font-bold", accent ? "text-white" : "text-ink-900")}>{value}</p>
      {hint && <p className={cn("mt-1 text-xs", accent ? "text-white/80" : "text-ink-500")}>{hint}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}

/* ------------------------------------------------------------- Table */
export function Table({ children, className, minWidthClass = "min-w-[640px]" }: { children: React.ReactNode; className?: string; minWidthClass?: string }) {
  return (
    <div className={cn("card overflow-x-auto", className)}>
      <table className={cn("w-full text-sm", minWidthClass)}>{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500 border-b border-ink-200 bg-ink-50", className)}>{children}</th>;
}

export function Td({ children, className, title }: { children?: React.ReactNode; className?: string; title?: string }) {
  return <td className={cn("px-4 py-3 align-middle border-b border-ink-100", className)} title={title}>{children}</td>;
}

export function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-ink-500">
        {message}
      </td>
    </tr>
  );
}

/* -------------------------------------------------------- Pagination */
export function Pagination({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (p: number) => string }) {
  if (pages <= 1) return null;
  return (
    <nav className="mt-4 flex items-center justify-between text-sm" aria-label="Pagination">
      <span className="text-ink-500">
        Page {page} of {pages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={hrefFor(page - 1)} className="btn btn-secondary btn-sm">
            Previous
          </Link>
        )}
        {page < pages && (
          <Link href={hrefFor(page + 1)} className="btn btn-secondary btn-sm">
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}
