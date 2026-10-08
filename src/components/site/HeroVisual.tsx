import { BarChart3, Bot, CloudCog, Globe, ShoppingCart, Smartphone } from "lucide-react";

/**
 * Lightweight, CSS-only product illustration: a dashboard window with a
 * floating mobile screen and feature badges. No images to download.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none" aria-hidden="true">
      {/* Dashboard window */}
      <div className="glass rounded-2xl p-3 shadow-2xl shadow-black/40 animate-fade-up" style={{ animationDelay: "150ms" }}>
        <div className="flex items-center gap-1.5 px-1 pb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 h-2 w-28 rounded-full bg-white/15" />
        </div>
        <div className="grid grid-cols-[72px_1fr] gap-3">
          <div className="space-y-2 rounded-xl bg-white/5 p-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`h-2 rounded-full ${i === 1 ? "bg-brand-400" : "bg-white/15"}`} />
            ))}
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Sales", value: "1.2M", color: "from-brand-500 to-brand-700" },
                { label: "Orders", value: "348", color: "from-cyan-500 to-cyan-700" },
                { label: "Stock", value: "92%", color: "from-accent-500 to-accent-600" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} p-2.5 text-white`}>
                  <div className="text-[10px] opacity-80">{s.label}</div>
                  <div className="text-base font-bold leading-tight">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="h-2 w-16 rounded-full bg-white/20" />
                <span className="h-2 w-8 rounded-full bg-white/10" />
              </div>
              <div className="flex items-end gap-1.5 h-20">
                {[35, 55, 40, 70, 60, 85, 50, 90, 65, 95, 75, 100].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-600 to-cyan-400" style={{ height: `${h}%`, opacity: 0.6 + (i / 12) * 0.4 }} />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5">
                  <span className="h-5 w-5 rounded-md bg-white/15" />
                  <span className="h-2 flex-1 rounded-full bg-white/15" />
                  <span className="h-2 w-10 rounded-full bg-emerald-400/70" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile screen */}
      <div className="absolute -bottom-6 -left-4 sm:-left-8 w-[128px] sm:w-[150px] animate-float">
        <div className="glass rounded-[22px] p-2 shadow-2xl shadow-black/50">
          <div className="rounded-[16px] bg-night-900 p-2.5 space-y-2">
            <div className="mx-auto h-1 w-10 rounded-full bg-white/20" />
            <div className="rounded-lg gradient-brand p-2 text-white">
              <div className="text-[9px] opacity-80">Bookings</div>
              <div className="text-sm font-bold">24 today</div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-1.5 rounded-md bg-white/5 p-1.5">
                <span className="h-4 w-4 rounded bg-white/15" />
                <span className="h-1.5 flex-1 rounded-full bg-white/15" />
              </div>
            ))}
            <div className="h-6 rounded-md bg-cyan-500/80" />
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <Badge className="-top-5 right-4 sm:-right-4" icon={<Bot className="h-4 w-4" />} label="AI Assistant" delay="300ms" />
      <Badge className="top-1/2 -right-3 sm:-right-10" icon={<CloudCog className="h-4 w-4" />} label="Cloud & Offline" delay="500ms" />
      <Badge className="-bottom-8 right-8 sm:right-16" icon={<ShoppingCart className="h-4 w-4" />} label="POS & Stock" delay="700ms" />
      <Badge className="-top-3 left-6 sm:-left-6" icon={<Globe className="h-4 w-4" />} label="Websites" delay="400ms" />
      <Badge className="bottom-16 -right-2 sm:-right-12 hidden sm:flex" icon={<BarChart3 className="h-4 w-4" />} label="Reports" delay="600ms" />
      <Badge className="top-20 -left-6 sm:-left-12 hidden sm:flex" icon={<Smartphone className="h-4 w-4" />} label="Mobile" delay="800ms" />
    </div>
  );
}

function Badge({ className, icon, label, delay }: { className: string; icon: React.ReactNode; label: string; delay: string }) {
  return (
    <div className={`absolute ${className} glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-lg animate-fade-up`} style={{ animationDelay: delay }}>
      <span className="grid h-6 w-6 place-items-center rounded-full gradient-brand">{icon}</span>
      {label}
    </div>
  );
}
