import { ArrowRight } from "lucide-react";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

/** "Websites → Business Systems → Advanced Platforms → AI-Powered Solutions" */
export function JourneyStrip({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <ol className={cn("flex flex-wrap items-center justify-center gap-x-2 gap-y-2", className)} aria-label="What Raremedia builds">
      {SITE.journey.map((step, i) => (
        <li key={step} className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs md:text-sm font-semibold",
              light ? "glass text-white" : "bg-white border border-ink-200 text-ink-800 shadow-sm",
            )}
          >
            {step}
          </span>
          {i < SITE.journey.length - 1 && <ArrowRight className={cn("h-4 w-4", light ? "text-brand-300" : "text-brand-500")} aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}
