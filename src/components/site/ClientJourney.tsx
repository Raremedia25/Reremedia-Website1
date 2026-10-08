import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Media } from "@prisma/client";
import { toImageSource } from "@/lib/media/image-src";
import { ResponsiveImage } from "./ResponsiveImage";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

/**
 * "Working with Raremedia" — illustrated client journey. Images come from the
 * media library folder `journey` (first 4, oldest first); captions are the step
 * descriptions. Admins can replace or re-caption them from Admin → Images.
 */
export function ClientJourney({ images }: { images: Media[] }) {
  if (images.length === 0) return null;
  return (
    <section className="section">
      <div className="container-x">
        <Reveal>
          <SectionHeading eyebrow="Working with us" title="From your first message to a system you rely on" description="Every project follows a simple, transparent path. Here is what it looks like from the client's side." />
        </Reveal>
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {images.slice(0, 4).map((m, i) => {
            const img = toImageSource(m);
            return (
              <Reveal key={m.id} as="li" delay={i * 70}>
                <div className="card card-hover h-full overflow-hidden">
                  <ResponsiveImage image={img} className="aspect-[4/3]" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
                  <div className="p-5">
                    <span className="font-display text-2xl font-extrabold gradient-text">0{i + 1}</span>
                    <h3 className="font-display mt-1 font-bold text-ink-900">{m.alt}</h3>
                    {m.caption && <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">{m.caption}</p>}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ol>
        <div className="mt-10 text-center">
          <Link href="/request-project" className="btn btn-primary">
            Start Your Project <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
