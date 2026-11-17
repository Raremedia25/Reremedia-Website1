"use client";

import { useState } from "react";
import { BarChart3, CheckCircle2, ClipboardCheck, FileText, Folder, FolderOpen, LayoutDashboard, Plus, Settings } from "lucide-react";
import { Badge, Btn, DataTable, DemoApp, FieldRow, Modal, Panel, SettingsPanel, ShareBars, Stat, inputCls, num } from "./kit";
import type { DemoProps } from "./registry";

type Status = "Draft" | "Prepared" | "Reviewed";
interface Paper {
  ref: string;
  folder: string;
  title: string;
  objective: string;
  work: string;
  conclusion: string;
  preparedBy: string;
  status: Status;
  notes: string[];
}

const FOLDERS = [
  { code: "A", name: "Planning" },
  { code: "B", name: "Risk assessment" },
  { code: "C", name: "Internal controls" },
  { code: "D", name: "Substantive testing" },
  { code: "E", name: "Completion & reporting" },
];

const PAPERS: Paper[] = [
  { ref: "A-1", folder: "A", title: "Engagement letter checklist", objective: "Confirm the terms of the engagement are agreed and documented.", work: "Reviewed the signed engagement letter against the checklist; confirmed scope, timetable and responsibilities.", conclusion: "Engagement terms are agreed and on file.", preparedBy: "Sample Auditor 1", status: "Reviewed", notes: [] },
  { ref: "A-2", folder: "A", title: "Materiality calculation", objective: "Set overall and performance materiality for the audit.", work: "Calculated overall materiality at 1% of sample revenue of 480,000,000 RWF = 4,800,000 RWF; performance materiality at 75% = 3,600,000 RWF.", conclusion: "Materiality levels set and communicated to the team.", preparedBy: "Sample Auditor 1", status: "Reviewed", notes: [] },
  { ref: "B-1", folder: "B", title: "Risk register", objective: "Identify and rate risks of material misstatement.", work: "Held a planning discussion and documented six risks; two rated significant (revenue cut-off, cash handling).", conclusion: "Significant risks carried forward to the testing plan.", preparedBy: "Sample Auditor 2", status: "Prepared", notes: ["Reviewer: add the IT access risk discussed on site."] },
  { ref: "C-1", folder: "C", title: "Cash receipts walkthrough", objective: "Understand and confirm the design of controls over cash receipts.", work: "Followed one receipt from the counter to the bank deposit; observed daily reconciliation and supervisor sign-off.", conclusion: "Controls are designed appropriately; operating effectiveness to be tested in C-2.", preparedBy: "Sample Auditor 2", status: "Prepared", notes: [] },
  { ref: "C-2", folder: "C", title: "Test of controls: daily reconciliations", objective: "Test that daily cash reconciliations are performed and reviewed.", work: "Selected 25 days at random; 24 reconciliations were signed by the supervisor, 1 was signed late.", conclusion: "Control operates effectively with one minor exception reported to management.", preparedBy: "Sample Auditor 3", status: "Draft", notes: [] },
  { ref: "D-1", folder: "D", title: "Revenue cut-off testing", objective: "Confirm sales are recorded in the correct period.", work: "Tested 15 invoices either side of the year end against delivery notes.", conclusion: "No cut-off errors found in the sample.", preparedBy: "Sample Auditor 3", status: "Prepared", notes: [] },
  { ref: "D-2", folder: "D", title: "Bank confirmation summary", objective: "Confirm bank balances directly with the banks.", work: "Sent confirmation requests for 3 sample accounts; 2 replies received and agreed, 1 outstanding.", conclusion: "Open: follow up the outstanding confirmation.", preparedBy: "Sample Auditor 1", status: "Draft", notes: [] },
  { ref: "E-1", folder: "E", title: "Summary of audit findings", objective: "Summarise findings and recommendations for the report.", work: "Collected exceptions from sections C and D and drafted recommendations.", conclusion: "Draft ready for manager review.", preparedBy: "Sample Auditor 2", status: "Draft", notes: [] },
];

const DEFAULT_SETTINGS = { engagement: "Sample Company Ltd · FY 2026 audit", reviewer: "Audit Manager (demo)", lock: "on", trail: "on" };
const TONE: Record<Status, "gray" | "amber" | "green"> = { Draft: "gray", Prepared: "amber", Reviewed: "green" };

export default function AuditDemo({ initialScreen, skipLogin }: DemoProps) {
  const [papers, setPapers] = useState(PAPERS);
  const [folder, setFolder] = useState("A");
  const [openRef, setOpenRef] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [draft, setDraft] = useState({ title: "", objective: "" });
  const [trail, setTrail] = useState<string[]>(["A-2 reviewed by Audit Manager (demo)", "C-1 prepared by Sample Auditor 2", "B-1 review note added"]);

  const reset = () => {
    setPapers(PAPERS);
    setFolder("A");
    setOpenRef(null);
    setSettings(DEFAULT_SETTINGS);
    setTrail(["A-2 reviewed by Audit Manager (demo)", "C-1 prepared by Sample Auditor 2", "B-1 review note added"]);
  };

  const open = papers.find((p) => p.ref === openRef) ?? null;
  const update = (ref: string, patch: Partial<Paper>, log: string) => {
    setPapers((list) => list.map((p) => (p.ref === ref ? { ...p, ...patch } : p)));
    setTrail((t) => [log, ...t].slice(0, 12));
  };
  const count = (s: Status) => papers.filter((p) => p.status === s).length;
  const refNo = (p: Paper) => Number(p.ref.split("-")[1]) || 0;
  const inFolder = papers.filter((p) => p.folder === folder).sort((a, b) => refNo(a) - refNo(b));
  const folderName = (code: string) => FOLDERS.find((f) => f.code === code)?.name ?? code;
  const locked = (p: Paper) => p.status === "Reviewed" && settings.lock === "on";

  const nextRef = (code: string) => {
    const used = papers.filter((p) => p.ref.startsWith(`${code}-`)).map((p) => Number(p.ref.split("-")[1]) || 0);
    return `${code}-${Math.max(0, ...used) + 1}`;
  };

  const paperTable = (rows: Paper[]) => (
    <DataTable
      rows={rows}
      rowKey={(p) => p.ref}
      empty="This folder has no working papers yet."
      columns={[
        { header: "Ref", cell: (p) => <span className="font-bold text-ink-900">{p.ref}</span> },
        { header: "Working paper", cell: (p) => <span className="font-semibold text-ink-900">{p.title}</span> },
        { header: "Prepared by", cell: (p) => p.preparedBy },
        { header: "Status", cell: (p) => <Badge tone={TONE[p.status]}>{p.status}</Badge> },
        {
          header: "",
          cell: (p) => (
            <Btn variant="outline" onClick={() => setOpenRef(p.ref)}>
              <FileText className="h-3.5 w-3.5" /> Open
            </Btn>
          ),
          align: "right",
        },
      ]}
    />
  );

  return (
    <>
      <DemoApp
        name="Audit Working Papers"
        tagline="One indexed audit file: every working paper in its folder, with who prepared it, who reviewed it and what was concluded."
        accent="#0f766e"
        role="Audit senior"
        initialScreen={initialScreen}
        skipLogin={skipLogin}
        onReset={reset}
        screens={[
          {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            render: () => (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-ink-700">{settings.engagement}</p>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <Stat label="Working papers" value={num(papers.length)} icon={FileText} />
                  <Stat label="Reviewed" value={num(count("Reviewed"))} icon={CheckCircle2} />
                  <Stat label="Awaiting review" value={num(count("Prepared"))} icon={ClipboardCheck} />
                  <Stat label="File completion" value={`${Math.round((count("Reviewed") / papers.length) * 100)}%`} icon={BarChart3} />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Panel title="Papers per section">
                    <ShareBars data={FOLDERS.map((f) => ({ label: `${f.code} · ${f.name}`, value: papers.filter((p) => p.folder === f.code).length }))} />
                  </Panel>
                  <Panel title="Recent activity">
                    <ul className="space-y-2 text-sm text-ink-700">
                      {trail.slice(0, 6).map((t, i) => (
                        <li key={`${t}-${i}`} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </Panel>
                </div>
              </div>
            ),
          },
          {
            id: "papers",
            label: "Working papers",
            icon: FolderOpen,
            render: () => (
              <div className="grid gap-4 lg:grid-cols-[230px_1fr]">
                <Panel title="Audit file">
                  <ul className="space-y-1">
                    {FOLDERS.map((f) => {
                      const on = folder === f.code;
                      return (
                        <li key={f.code}>
                          <button type="button" onClick={() => setFolder(f.code)} aria-current={on ? "true" : undefined} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm ${on ? "bg-teal-50 font-bold text-teal-900" : "text-ink-700 hover:bg-ink-50"}`}>
                            {on ? <FolderOpen className="h-4 w-4 shrink-0 text-teal-700" /> : <Folder className="h-4 w-4 shrink-0 text-ink-500" />}
                            <span className="min-w-0 flex-1 truncate">
                              {f.code}. {f.name}
                            </span>
                            <span className="text-xs tabular-nums text-ink-500">{papers.filter((p) => p.folder === f.code).length}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </Panel>
                <div className="space-y-4">
                  <Panel title={`${folder}. ${folderName(folder)}`}>{paperTable(inFolder)}</Panel>
                  <Panel title={`New working paper in section ${folder}`}>
                    <form
                      className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!draft.title.trim()) return;
                        const ref = nextRef(folder);
                        setPapers((list) => [...list, { ref, folder, title: draft.title.trim().slice(0, 60), objective: draft.objective.trim().slice(0, 200) || "Objective to be documented.", work: "Work not yet performed.", conclusion: "Open.", preparedBy: "Demo User", status: "Draft", notes: [] }]);
                        setTrail((t) => [`${ref} created by Demo User`, ...t]);
                        setDraft({ title: "", objective: "" });
                      }}
                    >
                      <FieldRow label="Title" htmlFor="au-title">
                        <input id="au-title" className={inputCls} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Payroll analytical review" required maxLength={60} />
                      </FieldRow>
                      <FieldRow label="Objective" htmlFor="au-obj">
                        <input id="au-obj" className={inputCls} value={draft.objective} onChange={(e) => setDraft({ ...draft, objective: e.target.value })} placeholder="What the paper sets out to confirm" maxLength={200} />
                      </FieldRow>
                      <Btn type="submit">
                        <Plus className="h-4 w-4" /> Create
                      </Btn>
                    </form>
                  </Panel>
                </div>
              </div>
            ),
          },
          { id: "review", label: "Review status", icon: ClipboardCheck, render: () => <Panel title="All working papers">{paperTable(papers)}</Panel> },
          {
            id: "reports",
            label: "Reports",
            icon: BarChart3,
            render: () => (
              <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Papers by status">
                  <ShareBars data={(["Draft", "Prepared", "Reviewed"] as const).map((s) => ({ label: s, value: count(s) }))} />
                </Panel>
                <Panel title="Open review notes">
                  {papers.some((p) => p.notes.length) ? (
                    <ul className="space-y-2 text-sm">
                      {papers.flatMap((p) => p.notes.map((n, i) => ({ key: `${p.ref}-${i}`, ref: p.ref, n }))).map((x) => (
                        <li key={x.key} className="rounded-lg border border-ink-200 p-2.5">
                          <span className="font-bold text-ink-900">{x.ref}</span> <span className="text-ink-700">{x.n}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-ink-500">No open review notes.</p>
                  )}
                </Panel>
                <Panel title="Audit trail" className="lg:col-span-2">
                  <ol className="space-y-1.5 text-sm text-ink-700">
                    {trail.map((t, i) => (
                      <li key={`${t}-${i}`}>
                        {i + 1}. {t}
                      </li>
                    ))}
                  </ol>
                </Panel>
              </div>
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
                  { key: "engagement", label: "Engagement name" },
                  { key: "reviewer", label: "Reviewer shown on sign-off" },
                ]}
                toggles={[
                  { key: "lock", label: "Lock papers after review", hint: "Reviewed papers can no longer be moved or changed." },
                  { key: "trail", label: "Keep a full audit trail" },
                ]}
              />
            ),
          },
        ]}
      />
      {open && (
        <Modal
          title={`${open.ref} · ${open.title}`}
          onClose={() => setOpenRef(null)}
          footer={
            <>
              {open.status === "Draft" && <Btn onClick={() => update(open.ref, { status: "Prepared" }, `${open.ref} marked as prepared by Demo User`)}>Mark as prepared</Btn>}
              {open.status === "Prepared" && <Btn onClick={() => update(open.ref, { status: "Reviewed", notes: [] }, `${open.ref} reviewed by ${settings.reviewer}`)}>Sign off as reviewed</Btn>}
              {open.status === "Reviewed" && (
                <Btn variant="outline" onClick={() => update(open.ref, { status: "Prepared" }, `${open.ref} review reopened`)}>
                  Reopen review
                </Btn>
              )}
            </>
          }
        >
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={TONE[open.status]}>{open.status}</Badge>
              <span className="text-ink-500">
                Section {open.folder}. {folderName(open.folder)} · Prepared by {open.preparedBy}
              </span>
            </div>
            {[
              ["Objective", open.objective],
              ["Work performed", open.work],
              ["Conclusion", open.conclusion],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs font-bold uppercase tracking-wide text-ink-500">{k}</p>
                <p className="mt-0.5 text-ink-900">{v}</p>
              </div>
            ))}
            {open.notes.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Review notes</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-ink-700">
                  {open.notes.map((n, i) => (
                    <li key={`${n}-${i}`}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
            {locked(open) ? (
              <p className="rounded-lg bg-ink-100 p-2.5 text-xs text-ink-700">This paper is reviewed and locked. Reopen the review to change it.</p>
            ) : (
              <div className="grid gap-3 border-t border-ink-200 pt-3 sm:grid-cols-2">
                <FieldRow label="Move to section" htmlFor="au-move">
                  <select
                    id="au-move"
                    className={inputCls}
                    value={open.folder}
                    onChange={(e) => {
                      const code = e.target.value;
                      const ref = nextRef(code);
                      update(open.ref, { folder: code, ref }, `${open.ref} moved to section ${code} as ${ref}`);
                      setOpenRef(ref);
                      setFolder(code);
                    }}
                  >
                    {FOLDERS.map((f) => (
                      <option key={f.code} value={f.code}>
                        {f.code}. {f.name}
                      </option>
                    ))}
                  </select>
                </FieldRow>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!note.trim()) return;
                    update(open.ref, { notes: [...open.notes, note.trim().slice(0, 160)] }, `${open.ref} review note added`);
                    setNote("");
                  }}
                >
                  <FieldRow label="Add a review note" htmlFor="au-note">
                    <div className="flex gap-2">
                      <input id="au-note" className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} maxLength={160} placeholder="Note for the preparer" />
                      <Btn type="submit" variant="outline">
                        Add
                      </Btn>
                    </div>
                  </FieldRow>
                </form>
              </div>
            )}
            <p className="text-xs text-ink-500">Sample engagement and figures for demonstration only.</p>
          </div>
        </Modal>
      )}
    </>
  );
}
