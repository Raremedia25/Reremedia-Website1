import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "", className)}>
      {eyebrow && <span className={cn("eyebrow", light && "text-brand-300")}>{eyebrow}</span>}
      <h2 className={cn("font-display mt-3 text-3xl md:text-4xl font-bold tracking-tight leading-tight", light ? "text-white" : "text-ink-900")}>{title}</h2>
      {description && <p className={cn("mt-4 text-base md:text-lg leading-relaxed", light ? "text-ink-300" : "text-ink-500")}>{description}</p>}
    </div>
  );
}
