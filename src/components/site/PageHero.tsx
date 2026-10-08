import { cn } from "@/lib/utils";

export function PageHero({ eyebrow, title, description, children, className }: { eyebrow?: string; title: string; description?: string; children?: React.ReactNode; className?: string }) {
  return (
    <section className={cn("relative overflow-hidden bg-night-900 text-white", className)}>
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
      <div className="absolute -top-32 left-1/3 h-80 w-80 rounded-full bg-brand-600/40 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-accent-500/25 blur-3xl" aria-hidden="true" />
      <div className="container-x relative py-16 md:py-24">
        <div className="max-w-3xl animate-fade-up">
          {eyebrow && <span className="eyebrow text-brand-300">{eyebrow}</span>}
          <h1 className="font-display mt-3 text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">{title}</h1>
          {description && <p className="mt-5 text-lg text-ink-300 leading-relaxed max-w-2xl">{description}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
