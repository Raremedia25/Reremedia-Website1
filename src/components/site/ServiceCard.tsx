import Link from "next/link";
import { Check } from "lucide-react";
import type { Service } from "@prisma/client";
import { parseList } from "@/lib/json";
import { cn } from "@/lib/utils";
import { ServiceIcon } from "./ServiceIcon";

export function ServiceCard({ service, compact = false, className }: { service: Service; compact?: boolean; className?: string }) {
  const items = parseList(service.items);
  return (
    <article id={service.slug} className={cn("card card-hover p-6 md:p-7 flex flex-col scroll-mt-28", className)}>
      <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-brand text-white shadow-glow">
        <ServiceIcon name={service.icon} className="h-6 w-6" />
      </div>
      <h3 className="font-display mt-5 text-xl font-bold text-ink-900">{service.name}</h3>
      <p className="mt-2 text-sm text-ink-500 leading-relaxed">{service.summary}</p>
      {items.length > 0 && (
        <ul className={cn("mt-5 grid gap-2 text-sm text-ink-700", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
          {(compact ? items.slice(0, 4) : items).map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      {compact && items.length > 4 && <p className="mt-2 text-xs text-ink-500">+ {items.length - 4} more</p>}
      <div className="mt-auto pt-6">
        <Link href={`/request-project?type=${encodeURIComponent(service.name)}`} className="text-sm font-semibold text-brand-700 hover:underline underline-offset-4">
          Request this service →
        </Link>
      </div>
    </article>
  );
}
