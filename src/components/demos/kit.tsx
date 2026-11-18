"use client";

/**
 * Shared building blocks for the interactive product demos (/demos/*).
 *
 * Every demo is a small client-side application: it runs entirely in the
 * visitor's browser on isolated sample data, never talks to a database or a
 * production system, and resets when the page is reloaded.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { FlaskConical, Lock, LogOut, RotateCcw, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const AccentContext = createContext("#7c3aed");
export const useAccent = () => useContext(AccentContext);

export const rwf = (n: number) => `${Math.round(n).toLocaleString("en-US")} RWF`;
export const num = (n: number) => Math.round(n).toLocaleString("en-US");

export interface DemoScreen {
  id: string;
  label: string;
  icon: LucideIcon;
  render: () => ReactNode;
}

export interface DemoAppProps {
  /** Product name shown in the app chrome. */
  name: string;
  /** Short line under the name on the sign-in screen. */
  tagline: string;
  accent: string;
  /** Role shown next to the demo user. */
  role: string;
  screens: DemoScreen[];
  initialScreen?: string;
  skipLogin?: boolean;
  onReset: () => void;
}

/** Application frame: simulated sign-in, sidebar navigation, top bar. */
export function DemoApp({ name, tagline, accent, role, screens, initialScreen, skipLogin, onReset }: DemoAppProps) {
  const [signedIn, setSignedIn] = useState(!!skipLogin);
  const [active, setActive] = useState(() => (screens.some((s) => s.id === initialScreen) ? initialScreen! : screens[0].id));
  const current = screens.find((s) => s.id === active) ?? screens[0];

  return (
    <AccentContext.Provider value={accent}>
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lift" data-demo-app>
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900">
          <FlaskConical className="h-4 w-4 shrink-0" />
          <span>Interactive demo · simulated with sample data · nothing is saved or sent to a real system</span>
        </div>
        {!signedIn ? (
          <LoginScreen name={name} tagline={tagline} onSignIn={() => setSignedIn(true)} />
        ) : (
          <div className="flex min-h-[620px] flex-col md:flex-row">
            <nav className="flex shrink-0 flex-col bg-night-900 text-white md:w-56" aria-label={`${name} demo navigation`}>
              <div className="flex items-center gap-2.5 px-4 py-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold text-white" style={{ background: accent }}>
                  {name.slice(0, 1)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-sm font-bold">{name}</span>
                  <span className="block text-[11px] text-ink-300">Demo workspace</span>
                </span>
              </div>
              <ul className="scrollbar-none flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible md:pb-4">
                {screens.map((s) => {
                  const on = s.id === current.id;
                  return (
                    <li key={s.id} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => setActive(s.id)}
                        aria-current={on ? "page" : undefined}
                        className={cn("flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors", on ? "text-white" : "text-ink-300 hover:bg-white/10 hover:text-white")}
                        style={on ? { background: accent } : undefined}
                      >
                        <s.icon className="h-4 w-4 shrink-0" />
                        <span className="whitespace-nowrap">{s.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-auto hidden border-t border-white/10 p-3 text-[11px] leading-relaxed text-ink-300 md:block">Sample data only. Reload the page or press Reset to start again.</div>
            </nav>
            <div className="flex min-w-0 flex-1 flex-col bg-ink-50">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-200 bg-white px-4 py-3">
                <h2 className="font-display text-lg font-bold text-ink-900">{current.label}</h2>
                <div className="flex items-center gap-2">
                  <span className="hidden text-right text-xs leading-tight sm:block">
                    <span className="block font-semibold text-ink-900">Demo User</span>
                    <span className="block text-ink-500">{role}</span>
                  </span>
                  <button type="button" onClick={onReset} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 text-xs font-semibold text-ink-700 hover:bg-ink-50" title="Restore the original sample data">
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </button>
                  <button type="button" onClick={() => setSignedIn(false)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 text-xs font-semibold text-ink-700 hover:bg-ink-50" title="Sign out of the demo">
                    <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sign out</span>
                  </button>
                </div>
              </header>
              <div key={current.id} className="animate-fade-up flex-1 p-4 md:p-5" style={{ animationDuration: "0.35s" }}>
                {current.render()}
              </div>
            </div>
          </div>
        )}
      </div>
    </AccentContext.Provider>
  );
}

function LoginScreen({ name, tagline, onSignIn }: { name: string; tagline: string; onSignIn: () => void }) {
  const accent = useAccent();
  return (
    <div className="grid min-h-[560px] md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-night-900 p-10 text-white md:flex md:flex-col md:justify-end">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-40 blur-3xl" style={{ background: accent }} aria-hidden="true" />
        <p className="relative font-display text-3xl font-bold leading-tight">{name}</p>
        <p className="relative mt-3 text-sm leading-relaxed text-ink-300">{tagline}</p>
      </div>
      <form
        className="flex flex-col justify-center p-6 sm:p-10"
        onSubmit={(e) => {
          e.preventDefault();
          onSignIn();
        }}
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: accent }}>
          <Lock className="h-5 w-5" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold text-ink-900">Sign in to {name}</h2>
        <p className="mt-1 text-sm text-ink-500">A demo account is filled in for you. No real credentials are needed or checked.</p>
        <label className="label mt-6" htmlFor="demo-user">
          Username
        </label>
        <input id="demo-user" className="input" defaultValue="demo@raremedia.example" readOnly />
        <label className="label mt-4" htmlFor="demo-pass">
          Password
        </label>
        <input id="demo-pass" className="input" type="password" defaultValue="demo-only" readOnly />
        <button type="submit" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" style={{ background: accent }}>
          Sign in to the demo
        </button>
        <p className="mt-4 text-xs text-ink-500">This sign-in screen is simulated. The demo runs only in your browser.</p>
      </form>
    </div>
  );
}

// ------------------------------------------------------------ primitives

export function Stat({ label, value, hint, icon: Icon }: { label: string; value: string; hint?: string; icon?: LucideIcon }) {
  const accent = useAccent();
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
        {Icon && <Icon className="h-4 w-4" style={{ color: accent }} />}
      </div>
      <p className="mt-2 font-display text-xl font-bold text-ink-900 sm:text-2xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-ink-200 bg-white", className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-200 px-4 py-3">
          {title && <h3 className="font-display text-sm font-bold text-ink-900">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Btn({ children, onClick, variant = "primary", type = "button", disabled, className, title }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "outline" | "danger"; type?: "button" | "submit"; disabled?: boolean; className?: string; title?: string }) {
  const accent = useAccent();
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "text-white hover:opacity-90",
        variant === "outline" && "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50",
        variant === "danger" && "border border-red-200 bg-white text-red-600 hover:bg-red-50",
        className,
      )}
      style={variant === "primary" ? { background: accent } : undefined}
    >
      {children}
    </button>
  );
}

const TONES = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-800",
  red: "bg-red-50 text-red-700",
  blue: "bg-sky-50 text-sky-700",
  gray: "bg-ink-100 text-ink-700",
} as const;

export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: keyof typeof TONES }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap", TONES[tone])}>{children}</span>;
}

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "right";
}

export function DataTable<T>({ columns, rows, rowKey, empty = "Nothing here yet." }: { columns: Column<T>[]; rows: T[]; rowKey: (row: T) => string; empty?: string }) {
  if (rows.length === 0) return <p className="py-6 text-center text-sm text-ink-500">{empty}</p>;
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <table className="w-full min-w-[460px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-200 text-xs uppercase tracking-wide text-ink-500">
            {columns.map((c) => (
              <th key={c.header} className={cn("px-2 py-2 font-semibold", c.align === "right" && "text-right")}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className="border-b border-ink-100 last:border-0">
              {columns.map((c) => (
                <td key={c.header} className={cn("px-2 py-2.5 text-ink-700", c.align === "right" && "text-right tabular-nums")}>
                  {c.cell(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Simple vertical bar chart (values are labelled, so it reads without colour). */
export function BarChart({ data, format = num, height = 160 }: { data: Array<{ label: string; value: number }>; format?: (n: number) => string; height?: number }) {
  const accent = useAccent();
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }} role="img" aria-label={data.map((d) => `${d.label}: ${format(d.value)}`).join(", ")}>
      {data.map((d) => (
        <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <span className="truncate text-[10px] font-semibold text-ink-500">{format(d.value)}</span>
          <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${Math.max(3, (d.value / max) * 72)}%`, background: accent, opacity: 0.55 + 0.45 * (d.value / max) }} />
          <span className="w-full truncate text-center text-[11px] text-ink-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Horizontal share bars for "top items" style reports. */
export function ShareBars({ data, format = num }: { data: Array<{ label: string; value: number }>; format?: (n: number) => string }) {
  const accent = useAccent();
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) return <p className="py-4 text-center text-sm text-ink-500">No data yet.</p>;
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex justify-between gap-3 text-sm">
            <span className="truncate text-ink-700">{d.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-ink-900">{format(d.value)}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-ink-100">
            <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${(d.value / max) * 100}%`, background: accent }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function FieldRow({ label, children, htmlFor }: { label: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-ink-700" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputCls = "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

/** Modal used for receipts, papers and confirmations inside a demo. */
export function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-night-950/60 p-4" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-3">
          <h3 className="font-display font-bold text-ink-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-sm font-semibold text-ink-500 hover:bg-ink-100" aria-label="Close">
            Close
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-ink-200 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export interface ReceiptData {
  business: string;
  subtitle?: string;
  number: string;
  when: string;
  lines: Array<{ name: string; qty: number; price: number }>;
  extras?: Array<{ label: string; amount: number }>;
  total: number;
  payment: string;
  footer?: string;
}

/** Thermal-style sample receipt. */
export function Receipt({ data }: { data: ReceiptData }) {
  const subtotal = data.lines.reduce((s, l) => s + l.qty * l.price, 0);
  return (
    <div className="mx-auto max-w-xs rounded-md border border-dashed border-ink-300 bg-white p-4 font-mono text-[12px] leading-relaxed text-ink-900">
      <p className="text-center text-sm font-bold">{data.business}</p>
      {data.subtitle && <p className="text-center text-ink-500">{data.subtitle}</p>}
      <p className="mt-1 text-center font-bold tracking-widest text-amber-700">*** SAMPLE RECEIPT ***</p>
      <div className="my-2 border-t border-dashed border-ink-300" />
      <p className="flex justify-between">
        <span>No. {data.number}</span>
        <span>{data.when}</span>
      </p>
      <div className="my-2 border-t border-dashed border-ink-300" />
      {data.lines.map((l) => (
        <div key={l.name} className="flex justify-between gap-2">
          <span className="min-w-0 truncate">
            {l.qty} x {l.name}
          </span>
          <span className="shrink-0 tabular-nums">{num(l.qty * l.price)}</span>
        </div>
      ))}
      <div className="my-2 border-t border-dashed border-ink-300" />
      <p className="flex justify-between">
        <span>Subtotal</span>
        <span className="tabular-nums">{num(subtotal)}</span>
      </p>
      {data.extras?.map((e) => (
        <p key={e.label} className="flex justify-between">
          <span>{e.label}</span>
          <span className="tabular-nums">{num(e.amount)}</span>
        </p>
      ))}
      <p className="mt-1 flex justify-between text-sm font-bold">
        <span>TOTAL</span>
        <span className="tabular-nums">{rwf(data.total)}</span>
      </p>
      <p className="flex justify-between">
        <span>Paid by</span>
        <span>{data.payment} (simulated)</span>
      </p>
      <div className="my-2 border-t border-dashed border-ink-300" />
      <p className="text-center">{data.footer ?? "Thank you!"}</p>
      <p className="text-center text-ink-500">Demo only: no payment was taken.</p>
    </div>
  );
}

/** Generic settings screen: a few editable preferences kept in demo state. */
export function SettingsPanel({ fields, values, onChange, toggles }: { fields: Array<{ key: string; label: string; type?: "text" | "number" }>; values: Record<string, string>; onChange: (key: string, value: string) => void; toggles?: Array<{ key: string; label: string; hint?: string }> }) {
  const accent = useAccent();
  const [saved, setSaved] = useState(false);
  const rows = useMemo(() => fields, [fields]);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="General">
        <div className="space-y-3">
          {rows.map((f) => (
            <FieldRow key={f.key} label={f.label} htmlFor={`set-${f.key}`}>
              <input
                id={`set-${f.key}`}
                className={inputCls}
                type={f.type ?? "text"}
                value={values[f.key] ?? ""}
                onChange={(e) => {
                  setSaved(false);
                  onChange(f.key, e.target.value);
                }}
              />
            </FieldRow>
          ))}
          <div className="flex items-center gap-3 pt-1">
            <Btn onClick={() => setSaved(true)}>Save settings</Btn>
            {saved && <span className="text-xs font-semibold text-emerald-700">Applied to this demo session.</span>}
          </div>
        </div>
      </Panel>
      {toggles && toggles.length > 0 && (
        <Panel title="Preferences">
          <ul className="space-y-3">
            {toggles.map((t) => {
              const on = values[t.key] === "on";
              return (
                <li key={t.key} className="flex items-start justify-between gap-4">
                  <span>
                    <span className="block text-sm font-semibold text-ink-900">{t.label}</span>
                    {t.hint && <span className="block text-xs text-ink-500">{t.hint}</span>}
                  </span>
                  <button type="button" role="switch" aria-checked={on} aria-label={t.label} onClick={() => onChange(t.key, on ? "off" : "on")} className="relative h-6 w-11 shrink-0 rounded-full transition-colors" style={{ background: on ? accent : "#cbd5e1" }}>
                    <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", on ? "left-[22px]" : "left-0.5")} />
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </div>
  );
}

export function nowLabel() {
  return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
