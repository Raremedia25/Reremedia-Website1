"use client";

import { useEffect, useMemo, useState } from "react";
import qrcode from "qrcode-generator";
import { Award, BookOpen, FilePlus2, LayoutDashboard, QrCode, Settings, ShieldCheck, ShieldX, Users } from "lucide-react";
import { Badge, BarChart, Btn, DataTable, DemoApp, FieldRow, Modal, Panel, SettingsPanel, Stat, inputCls, num } from "./kit";
import type { DemoProps } from "./registry";

interface Certificate {
  id: string;
  student: string;
  course: string;
  grade: string;
  date: string;
}

const COURSES = [
  { name: "Computer Basics & Office Applications", weeks: 8, learners: 46 },
  { name: "Web Development Fundamentals", weeks: 12, learners: 31 },
  { name: "Graphic Design", weeks: 10, learners: 22 },
  { name: "Digital Marketing", weeks: 6, learners: 18 },
  { name: "Accounting Software", weeks: 6, learners: 14 },
];
const GRADES = ["Distinction", "Merit", "Pass"];
const ISSUED: Certificate[] = [
  { id: "RM-2026-0101", student: "Sample Student One", course: COURSES[0].name, grade: "Distinction", date: "2026-09-12" },
  { id: "RM-2026-0102", student: "Sample Student Two", course: COURSES[1].name, grade: "Merit", date: "2026-09-12" },
  { id: "RM-2026-0103", student: "Sample Student Three", course: COURSES[2].name, grade: "Pass", date: "2026-10-03" },
];
const DEFAULT_SETTINGS = { institution: "Sample Training Centre", signatory: "Director of Training", prefix: "RM-2026-", qr: "on", watermark: "on" };

// Certificates are packed into the QR link itself, so a phone that scans the
// code can show the same sample details without any server or database.
function encode(c: Certificate): string {
  const bytes = new TextEncoder().encode(JSON.stringify([c.id, c.student, c.course, c.grade, c.date]));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decode(payload: string): Certificate | null {
  try {
    const bin = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const data: unknown = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0))));
    if (!Array.isArray(data) || data.length !== 5 || data.some((v) => typeof v !== "string" || v.length > 80)) return null;
    const [id, student, course, grade, date] = data as string[];
    if (!COURSES.some((c) => c.name === course) || !GRADES.includes(grade)) return null;
    return { id, student, course, grade, date };
  } catch {
    return null;
  }
}

function QrSvg({ text, size = 96 }: { text: string; size?: number }) {
  const path = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount();
    let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    return { d, n };
  }, [text]);
  return (
    <svg width={size} height={size} viewBox={`-2 -2 ${path.n + 4} ${path.n + 4}`} role="img" aria-label="QR code that opens the sample verification page" shapeRendering="crispEdges">
      <rect x={-2} y={-2} width={path.n + 4} height={path.n + 4} fill="#fff" />
      <path d={path.d} fill="#0f172a" />
    </svg>
  );
}

function prettyDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function CertificatePreview({ cert, institution, signatory, link, showQr, watermark }: { cert: Certificate; institution: string; signatory: string; link: string; showQr: boolean; watermark: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-lg border-[6px] border-double border-emerald-700 bg-[#fffdf5] p-5 text-center sm:p-8">
      {watermark && (
        <span className="pointer-events-none absolute inset-0 grid place-items-center font-display text-6xl font-extrabold tracking-widest text-emerald-900/[0.07] sm:text-8xl" aria-hidden="true">
          SAMPLE
        </span>
      )}
      <Award className="mx-auto h-9 w-9 text-emerald-700" />
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-800">{institution || "Institution name"}</p>
      <p className="mt-3 font-display text-2xl font-bold text-ink-900 sm:text-3xl">Certificate of Completion</p>
      <p className="mt-3 text-sm text-ink-500">This certifies that</p>
      <p className="mt-1 break-words font-display text-xl font-bold text-emerald-800 sm:text-2xl">{cert.student || "Student name"}</p>
      <p className="mt-2 text-sm text-ink-500">has successfully completed the course</p>
      <p className="mt-1 font-semibold text-ink-900">{cert.course}</p>
      <p className="mt-2 text-sm text-ink-700">
        Grade: <strong>{cert.grade}</strong> · Awarded on {prettyDate(cert.date)}
      </p>
      <div className="mt-5 flex items-end justify-between gap-4 text-left">
        <div className="text-xs text-ink-700">
          <div className="mb-1 h-px w-32 bg-ink-500" />
          <p className="font-semibold">{signatory || "Signatory"}</p>
          <p className="text-ink-500">Certificate No. {cert.id}</p>
        </div>
        {showQr && link && (
          <div className="shrink-0 text-center">
            <QrSvg text={link} />
            <p className="mt-0.5 text-[10px] text-ink-500">Scan to verify</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CertificateDemo({ initialScreen, skipLogin, verify }: DemoProps) {
  const scanned = useMemo(() => (verify ? decode(verify) : null), [verify]);
  const [issued, setIssued] = useState(ISSUED);
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [form, setForm] = useState({ student: "", course: COURSES[0].name, grade: "Merit", date: "2026-11-17" });
  const [lookup, setLookup] = useState(verify ? "" : "RM-2026-0101");
  const [checked, setChecked] = useState<{ id: string; cert: Certificate | null } | null>(scanned ? { id: scanned.id, cert: scanned } : verify ? { id: "scanned code", cert: null } : null);
  const [open, setOpen] = useState<Certificate | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  const reset = () => {
    setIssued(ISSUED);
    setSettings(DEFAULT_SETTINGS);
    setForm({ student: "", course: COURSES[0].name, grade: "Merit", date: "2026-11-17" });
    setChecked(null);
  };

  const nextId = `${settings.prefix}${String(101 + issued.length).padStart(4, "0")}`;
  const draft: Certificate = { id: nextId, student: form.student.trim(), course: form.course, grade: form.grade, date: form.date };
  const linkFor = (c: Certificate) => (origin ? `${origin}/demos/certificates?verify=${encode(c)}` : "");
  const preview = (c: Certificate) => <CertificatePreview cert={c} institution={settings.institution} signatory={settings.signatory} link={linkFor(c)} showQr={settings.qr === "on"} watermark={settings.watermark === "on"} />;

  const perCourse = COURSES.map((c) => ({ label: c.name.split(" ")[0], value: issued.filter((i) => i.course === c.name).length }));

  return (
    <>
      <DemoApp
        name="Certificate Generator"
        tagline="Issue training certificates in seconds and let anyone confirm they are genuine by scanning a QR code."
        accent="#059669"
        role="Registrar"
        initialScreen={verify ? "verify" : initialScreen}
        skipLogin={skipLogin || !!verify}
        onReset={reset}
        screens={[
          {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            render: () => (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <Stat label="Certificates issued" value={num(issued.length)} icon={Award} />
                  <Stat label="Courses" value={num(COURSES.length)} icon={BookOpen} />
                  <Stat label="Learners enrolled" value={num(COURSES.reduce((s, c) => s + c.learners, 0))} icon={Users} hint="Sample figure" />
                  <Stat label="Distinctions" value={num(issued.filter((i) => i.grade === "Distinction").length)} icon={ShieldCheck} />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Panel title="Certificates per course">
                    <BarChart data={perCourse} />
                  </Panel>
                  <Panel title="Recently issued">
                    <ul className="space-y-2">
                      {[...issued].reverse().slice(0, 4).map((c) => (
                        <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-ink-900">{c.student}</span>
                            <span className="block truncate text-xs text-ink-500">{c.course}</span>
                          </span>
                          <Badge tone="green">{c.id}</Badge>
                        </li>
                      ))}
                    </ul>
                  </Panel>
                </div>
              </div>
            ),
          },
          {
            id: "generate",
            label: "Generate",
            icon: FilePlus2,
            render: () => (
              <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                <Panel title="Student details">
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!draft.student) return;
                      setIssued((list) => [...list, draft]);
                      setOpen(draft);
                      setForm({ ...form, student: "" });
                    }}
                  >
                    <FieldRow label="Student name" htmlFor="ce-name">
                      <input id="ce-name" className={inputCls} value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} placeholder="Type a sample name" required maxLength={60} />
                    </FieldRow>
                    <FieldRow label="Course" htmlFor="ce-course">
                      <select id="ce-course" className={inputCls} value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                        {COURSES.map((c) => (
                          <option key={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </FieldRow>
                    <div className="grid grid-cols-2 gap-2">
                      <FieldRow label="Grade" htmlFor="ce-grade">
                        <select id="ce-grade" className={inputCls} value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
                          {GRADES.map((g) => (
                            <option key={g}>{g}</option>
                          ))}
                        </select>
                      </FieldRow>
                      <FieldRow label="Award date" htmlFor="ce-date">
                        <input id="ce-date" className={inputCls} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                      </FieldRow>
                    </div>
                    <Btn type="submit" className="w-full" disabled={!draft.student}>
                      Issue sample certificate
                    </Btn>
                    <p className="text-[11px] text-ink-500">Use a made-up name. The preview updates as you type and nothing is stored.</p>
                  </form>
                </Panel>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Live preview</p>
                  {preview(draft)}
                </div>
              </div>
            ),
          },
          {
            id: "issued",
            label: "Certificates",
            icon: Award,
            render: () => (
              <Panel title={`Issued certificates (${issued.length})`}>
                <DataTable
                  rows={[...issued].reverse()}
                  rowKey={(c) => c.id}
                  columns={[
                    { header: "Number", cell: (c) => <span className="font-semibold text-ink-900">{c.id}</span> },
                    { header: "Student", cell: (c) => c.student },
                    { header: "Course", cell: (c) => c.course },
                    { header: "Grade", cell: (c) => <Badge tone={c.grade === "Distinction" ? "green" : c.grade === "Merit" ? "blue" : "gray"}>{c.grade}</Badge> },
                    { header: "Date", cell: (c) => prettyDate(c.date) },
                    {
                      header: "",
                      cell: (c) => (
                        <Btn variant="outline" onClick={() => setOpen(c)}>
                          Open
                        </Btn>
                      ),
                      align: "right",
                    },
                  ]}
                />
              </Panel>
            ),
          },
          {
            id: "verify",
            label: "Verify",
            icon: QrCode,
            render: () => (
              <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
                <Panel title="Check a certificate">
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const id = lookup.trim().toUpperCase();
                      if (id) setChecked({ id, cert: issued.find((c) => c.id.toUpperCase() === id) ?? null });
                    }}
                  >
                    <FieldRow label="Certificate number" htmlFor="ce-lookup">
                      <input id="ce-lookup" className={inputCls} value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="RM-2026-0101" maxLength={30} />
                    </FieldRow>
                    <Btn type="submit" className="w-full">
                      Verify
                    </Btn>
                    <p className="text-xs text-ink-500">Try RM-2026-0101, a certificate you issued in this demo, or a number that does not exist such as RM-2026-9999. Scanning the QR code on a certificate opens this screen with the result.</p>
                  </form>
                </Panel>
                <Panel title="Result">
                  {!checked ? (
                    <p className="py-8 text-center text-sm text-ink-500">Enter a certificate number or scan a QR code.</p>
                  ) : checked.cert ? (
                    <div>
                      <div className="flex items-start gap-3 rounded-lg bg-emerald-50 p-3 text-emerald-900">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>
                          <p className="font-bold">Record found: {checked.cert.id}</p>
                          <p className="text-sm">The details below match a sample certificate.</p>
                        </div>
                      </div>
                      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                        {[
                          ["Student", checked.cert.student],
                          ["Course", checked.cert.course],
                          ["Grade", checked.cert.grade],
                          ["Awarded", prettyDate(checked.cert.date)],
                        ].map(([k, v]) => (
                          <div key={k} className="rounded-lg border border-ink-200 p-2.5">
                            <dt className="text-xs text-ink-500">{k}</dt>
                            <dd className="break-words font-semibold text-ink-900">{v}</dd>
                          </div>
                        ))}
                      </dl>
                      <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-xs font-semibold text-amber-900">Simulated verification with sample data. This is not a real certificate and proves no qualification.</p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 text-red-800">
                      <ShieldX className="mt-0.5 h-5 w-5 shrink-0" />
                      <div>
                        <p className="font-bold">No record for {checked.id}</p>
                        <p className="text-sm">A real installation would warn that this certificate cannot be confirmed.</p>
                      </div>
                    </div>
                  )}
                </Panel>
              </div>
            ),
          },
          {
            id: "courses",
            label: "Courses",
            icon: BookOpen,
            render: () => (
              <Panel title="Courses">
                <DataTable
                  rows={COURSES}
                  rowKey={(c) => c.name}
                  columns={[
                    { header: "Course", cell: (c) => <span className="font-semibold text-ink-900">{c.name}</span> },
                    { header: "Duration", cell: (c) => `${c.weeks} weeks` },
                    { header: "Learners (sample)", cell: (c) => c.learners, align: "right" },
                    { header: "Certificates issued", cell: (c) => issued.filter((i) => i.course === c.name).length, align: "right" },
                  ]}
                />
              </Panel>
            ),
          },
          {
            id: "settings",
            label: "Settings",
            icon: Settings,
            render: () => (
              <SettingsPanel
                values={settings}
                onChange={(k, v) => setSettings((s) => ({ ...s, [k]: v }))}
                fields={[
                  { key: "institution", label: "Institution name (printed on certificates)" },
                  { key: "signatory", label: "Signatory title" },
                  { key: "prefix", label: "Certificate number prefix" },
                ]}
                toggles={[
                  { key: "qr", label: "Print a verification QR code" },
                  { key: "watermark", label: "Show the SAMPLE watermark", hint: "Real certificates are issued without it." },
                ]}
              />
            ),
          },
        ]}
      />
      {open && (
        <Modal
          title={`Certificate ${open.id}`}
          onClose={() => setOpen(null)}
          footer={
            <>
              {linkFor(open) && (
                <a href={linkFor(open)} className="inline-flex min-h-9 items-center rounded-lg border border-ink-200 px-3 text-sm font-semibold text-ink-700 hover:bg-ink-50">
                  Open verification link
                </a>
              )}
              <Btn onClick={() => setOpen(null)}>Done</Btn>
            </>
          }
        >
          {preview(open)}
        </Modal>
      )}
    </>
  );
}
