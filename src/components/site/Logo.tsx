import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 font-display font-800 text-xl tracking-tight", className)} aria-label="Raremedia home">
      <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white text-lg font-extrabold shadow-glow">R</span>
      <span className={cn("font-extrabold", light ? "text-white" : "text-ink-900")}>
        Rare<span className="gradient-text">media</span>
      </span>
    </Link>
  );
}
