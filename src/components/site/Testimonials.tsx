import Link from "next/link";
import { Quote, Star } from "lucide-react";
import type { Media, Testimonial } from "@prisma/client";
import { toMediaDTO } from "@/lib/media/dto";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

type Item = Testimonial & { photo: Media | null; project: { title: string; slug: string } | null };

/** Renders nothing when there are no published testimonials. */
export function Testimonials({ items, light = false }: { items: Item[]; light?: boolean }) {
  if (items.length === 0) return null;
  return (
    <section className={light ? "section bg-night-900 text-white" : "section bg-ink-50"}>
      <div className="container-x">
        <Reveal>
          <SectionHeading light={light} eyebrow="Clients" title="What clients say about working with us" />
        </Reveal>
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => {
            const photo = t.photo ? toMediaDTO(t.photo) : null;
            return (
              <Reveal key={t.id} as="li" delay={(i % 3) * 60}>
                <figure className="card h-full p-6 flex flex-col">
                  <Quote className="h-7 w-7 text-brand-300" aria-hidden="true" />
                  <blockquote className="mt-3 text-ink-700 leading-relaxed flex-1">“{t.quote}”</blockquote>
                  <div className="mt-4 flex items-center gap-1" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, s) => (
                      <Star key={s} className={s < t.rating ? "h-4 w-4 fill-amber-400 text-amber-400" : "h-4 w-4 text-ink-300"} aria-hidden="true" />
                    ))}
                  </div>
                  <figcaption className="mt-4 flex items-center gap-3 border-t border-ink-100 pt-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full gradient-brand text-sm font-bold text-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {photo ? <img src={photo.thumbUrl} alt={photo.alt || t.name} className="h-full w-full object-cover" loading="lazy" /> : t.name.charAt(0)}
                    </span>
                    <span>
                      <span className="block font-semibold text-ink-900">{t.name}</span>
                      <span className="block text-xs text-ink-500">{[t.role, t.company].filter(Boolean).join(" · ")}</span>
                      {t.project && (
                        <Link href={`/projects/${t.project.slug}`} className="block text-xs font-semibold text-brand-700 hover:underline">
                          {t.project.title}
                        </Link>
                      )}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
