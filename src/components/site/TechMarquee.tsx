import { TECHNOLOGIES } from "@/lib/site";

export function TechMarquee() {
  const items = TECHNOLOGIES.flatMap((g) => g.items);
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <ul className="flex w-max gap-3 animate-marquee hover:[animation-play-state:paused]" aria-label="Technologies">
        {doubled.map((t, i) => (
          <li key={`${t}-${i}`} className="chip bg-white border border-ink-200 text-ink-700 px-4 py-2 text-sm shadow-sm" aria-hidden={i >= items.length}>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
