"use client";

import { useMemo, useState } from "react";
import { BarChart3, Calculator, HandCoins, LayoutDashboard, PiggyBank, Plus, Settings, Users, Wallet } from "lucide-react";
import { Badge, BarChart, Btn, DataTable, DemoApp, FieldRow, Panel, SettingsPanel, ShareBars, Stat, inputCls, nowLabel, num, rwf } from "./kit";
import type { DemoProps } from "./registry";

interface Member {
  id: string;
  name: string;
  phone: string;
  joined: string;
  savings: number;
}
interface Contribution {
  id: string;
  memberId: string;
  amount: number;
  when: string;
}
interface Loan {
  id: string;
  memberId: string;
  principal: number;
  rate: number;
  months: number;
  totalDue: number;
  paid: number;
}
interface Repayment {
  id: string;
  loanId: string;
  amount: number;
  when: string;
}

const MEMBERS: Member[] = [
  { id: "M-001", name: "Sample Member A", phone: "07XX XXX 101", joined: "Jan 2025", savings: 240000 },
  { id: "M-002", name: "Sample Member B", phone: "07XX XXX 102", joined: "Jan 2025", savings: 310000 },
  { id: "M-003", name: "Sample Member C", phone: "07XX XXX 103", joined: "Mar 2025", savings: 185000 },
  { id: "M-004", name: "Sample Member D", phone: "07XX XXX 104", joined: "Jun 2025", savings: 120000 },
  { id: "M-005", name: "Sample Member E", phone: "07XX XXX 105", joined: "Sep 2025", savings: 95000 },
];
const CONTRIBUTIONS: Contribution[] = [
  { id: "C-501", memberId: "M-001", amount: 20000, when: "02 Nov" },
  { id: "C-502", memberId: "M-002", amount: 20000, when: "02 Nov" },
  { id: "C-503", memberId: "M-003", amount: 15000, when: "02 Nov" },
  { id: "C-504", memberId: "M-004", amount: 20000, when: "09 Nov" },
];
const LOANS: Loan[] = [
  { id: "L-021", memberId: "M-002", principal: 300000, rate: 2, months: 6, totalDue: 336000, paid: 168000 },
  { id: "L-022", memberId: "M-003", principal: 150000, rate: 2, months: 3, totalDue: 159000, paid: 53000 },
];
const REPAYMENTS: Repayment[] = [
  { id: "R-310", loanId: "L-021", amount: 56000, when: "05 Sep" },
  { id: "R-311", loanId: "L-021", amount: 56000, when: "05 Oct" },
  { id: "R-312", loanId: "L-022", amount: 53000, when: "12 Oct" },
  { id: "R-313", loanId: "L-021", amount: 56000, when: "05 Nov" },
];
const MONTHS = [
  { label: "Jun", value: 310000 },
  { label: "Jul", value: 335000 },
  { label: "Aug", value: 342000 },
  { label: "Sep", value: 360000 },
  { label: "Oct", value: 371000 },
];
const DEFAULT_SETTINGS = { group: "Sample Savings Group", share: "20000", rate: "2", sms: "on", approval: "on" };

export default function IkiminaDemo({ initialScreen, skipLogin }: DemoProps) {
  const [members, setMembers] = useState(MEMBERS);
  const [contributions, setContributions] = useState(CONTRIBUTIONS);
  const [loans, setLoans] = useState(LOANS);
  const [repayments, setRepayments] = useState(REPAYMENTS);
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [newMember, setNewMember] = useState({ name: "", phone: "" });
  const [contrib, setContrib] = useState({ memberId: "M-001", amount: "20000" });
  const [calc, setCalc] = useState({ memberId: "M-001", amount: "200000", rate: "2", months: "6" });
  const [notice, setNotice] = useState("");

  const reset = () => {
    setMembers(MEMBERS);
    setContributions(CONTRIBUTIONS);
    setLoans(LOANS);
    setRepayments(REPAYMENTS);
    setSettings(DEFAULT_SETTINGS);
    setNotice("");
  };

  const memberName = (id: string) => members.find((m) => m.id === id)?.name ?? id;
  const totalSavings = members.reduce((s, m) => s + m.savings, 0);
  const outstanding = loans.reduce((s, l) => s + (l.totalDue - l.paid), 0);
  const novTotal = contributions.reduce((s, c) => s + c.amount, 0);

  // Flat-rate loan: interest = principal x monthly rate x months, repaid in equal instalments.
  const principal = Math.max(0, Number(calc.amount) || 0);
  const rate = Math.max(0, Number(calc.rate) || 0);
  const months = Math.max(1, Math.min(36, Math.floor(Number(calc.months) || 1)));
  const interest = (principal * rate * months) / 100;
  const totalDue = principal + interest;
  const instalment = totalDue / months;
  const schedule = useMemo(() => Array.from({ length: months }, (_, i) => ({ n: i + 1, instalment, balance: Math.max(0, totalDue - instalment * (i + 1)) })), [months, instalment, totalDue]);
  const borrower = members.find((m) => m.id === calc.memberId);
  const maxLoan = (borrower?.savings ?? 0) * 3;

  const instalmentOf = (l: Loan) => Math.min(l.totalDue - l.paid, Math.round(l.totalDue / l.months));

  return (
    <DemoApp
      name="Ikimina Management"
      tagline="Members, savings, loans and repayments for savings groups and cooperatives, with clear records everyone can trust."
      accent="#7c3aed"
      role="Treasurer"
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
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Members" value={num(members.length)} icon={Users} />
                <Stat label="Total savings" value={rwf(totalSavings)} icon={PiggyBank} />
                <Stat label="Loans outstanding" value={rwf(outstanding)} icon={HandCoins} hint={`${loans.filter((l) => l.paid < l.totalDue).length} active loans`} />
                <Stat label="Collected this month" value={rwf(novTotal)} icon={Wallet} />
              </div>
              <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                <Panel title="Monthly contributions (sample)">
                  <BarChart data={[...MONTHS, { label: "Nov", value: novTotal }]} format={(n) => `${Math.round(n / 1000)}k`} />
                </Panel>
                <Panel title="Top savers">
                  <ShareBars data={[...members].sort((a, b) => b.savings - a.savings).slice(0, 5).map((m) => ({ label: m.name, value: m.savings }))} format={rwf} />
                </Panel>
              </div>
            </div>
          ),
        },
        {
          id: "members",
          label: "Members",
          icon: Users,
          render: () => (
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <Panel title={`Members (${members.length})`}>
                <DataTable
                  rows={members}
                  rowKey={(m) => m.id}
                  columns={[
                    { header: "No.", cell: (m) => m.id },
                    { header: "Name", cell: (m) => <span className="font-semibold text-ink-900">{m.name}</span> },
                    { header: "Phone", cell: (m) => m.phone },
                    { header: "Joined", cell: (m) => m.joined },
                    { header: "Savings", cell: (m) => rwf(m.savings), align: "right" },
                  ]}
                />
              </Panel>
              <Panel title="Register a member">
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newMember.name.trim()) return;
                    const id = `M-${String(members.length + 1).padStart(3, "0")}`;
                    setMembers((list) => [...list, { id, name: newMember.name.trim().slice(0, 40), phone: newMember.phone.trim().slice(0, 20) || "07XX XXX XXX", joined: "Nov 2026", savings: 0 }]);
                    setNotice(`${newMember.name.trim()} registered as ${id}.`);
                    setNewMember({ name: "", phone: "" });
                  }}
                >
                  <FieldRow label="Full name" htmlFor="ik-name">
                    <input id="ik-name" className={inputCls} value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} placeholder="e.g. Sample Member F" required maxLength={40} />
                  </FieldRow>
                  <FieldRow label="Phone" htmlFor="ik-phone">
                    <input id="ik-phone" className={inputCls} value={newMember.phone} onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })} placeholder="07XX XXX XXX" maxLength={20} />
                  </FieldRow>
                  <Btn type="submit" className="w-full">
                    <Plus className="h-4 w-4" /> Register member
                  </Btn>
                  <p className="text-[11px] text-ink-500">Use made-up details. Nothing you type leaves your browser.</p>
                  {notice && <p className="text-xs font-semibold text-emerald-700">{notice}</p>}
                </form>
              </Panel>
            </div>
          ),
        },
        {
          id: "savings",
          label: "Savings",
          icon: PiggyBank,
          render: () => (
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <Panel title="Contributions this month">
                <DataTable
                  rows={[...contributions].reverse()}
                  rowKey={(c) => c.id}
                  columns={[
                    { header: "Receipt", cell: (c) => c.id },
                    { header: "Member", cell: (c) => <span className="font-semibold text-ink-900">{memberName(c.memberId)}</span> },
                    { header: "Date", cell: (c) => c.when },
                    { header: "Amount", cell: (c) => rwf(c.amount), align: "right" },
                  ]}
                />
              </Panel>
              <Panel title="Record a contribution">
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const amount = Number(contrib.amount);
                    if (!(amount > 0)) return;
                    setContributions((list) => [...list, { id: `C-${501 + list.length}`, memberId: contrib.memberId, amount, when: nowLabel() }]);
                    setMembers((list) => list.map((m) => (m.id === contrib.memberId ? { ...m, savings: m.savings + amount } : m)));
                  }}
                >
                  <FieldRow label="Member" htmlFor="ik-cm">
                    <select id="ik-cm" className={inputCls} value={contrib.memberId} onChange={(e) => setContrib({ ...contrib, memberId: e.target.value })}>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </FieldRow>
                  <FieldRow label="Amount (RWF)" htmlFor="ik-ca">
                    <input id="ik-ca" className={inputCls} type="number" min={1} value={contrib.amount} onChange={(e) => setContrib({ ...contrib, amount: e.target.value })} required />
                  </FieldRow>
                  <Btn type="submit" className="w-full">
                    Record contribution
                  </Btn>
                  <p className="text-xs text-ink-500">
                    Balance of {memberName(contrib.memberId)}: <strong className="text-ink-900">{rwf(members.find((m) => m.id === contrib.memberId)?.savings ?? 0)}</strong>
                  </p>
                </form>
              </Panel>
            </div>
          ),
        },
        {
          id: "loans",
          label: "Loans",
          icon: Calculator,
          render: () => (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
                <Panel title="Loan calculator">
                  <div className="space-y-3">
                    <FieldRow label="Member" htmlFor="ik-lm">
                      <select id="ik-lm" className={inputCls} value={calc.memberId} onChange={(e) => setCalc({ ...calc, memberId: e.target.value })}>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </FieldRow>
                    <FieldRow label="Loan amount (RWF)" htmlFor="ik-la">
                      <input id="ik-la" className={inputCls} type="number" min={0} step={10000} value={calc.amount} onChange={(e) => setCalc({ ...calc, amount: e.target.value })} />
                    </FieldRow>
                    <div className="grid grid-cols-2 gap-2">
                      <FieldRow label="Interest % / month" htmlFor="ik-lr">
                        <input id="ik-lr" className={inputCls} type="number" min={0} step={0.5} value={calc.rate} onChange={(e) => setCalc({ ...calc, rate: e.target.value })} />
                      </FieldRow>
                      <FieldRow label="Months" htmlFor="ik-ln">
                        <input id="ik-ln" className={inputCls} type="number" min={1} max={36} value={calc.months} onChange={(e) => setCalc({ ...calc, months: e.target.value })} />
                      </FieldRow>
                    </div>
                    <dl className="space-y-1.5 rounded-lg bg-brand-50 p-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-ink-700">Interest</dt>
                        <dd className="font-semibold tabular-nums text-ink-900">{rwf(interest)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-ink-700">Total to repay</dt>
                        <dd className="font-semibold tabular-nums text-ink-900">{rwf(totalDue)}</dd>
                      </div>
                      <div className="flex justify-between font-display text-base font-bold">
                        <dt className="text-ink-900">Monthly instalment</dt>
                        <dd className="tabular-nums text-brand-700">{rwf(instalment)}</dd>
                      </div>
                    </dl>
                    <p className={`text-xs ${principal > maxLoan ? "font-semibold text-red-600" : "text-ink-500"}`}>
                      Sample rule: a member can borrow up to 3 times their savings ({rwf(maxLoan)}).
                    </p>
                    <Btn
                      className="w-full"
                      disabled={principal <= 0 || principal > maxLoan}
                      onClick={() => setLoans((list) => [...list, { id: `L-${String(21 + list.length).padStart(3, "0")}`, memberId: calc.memberId, principal, rate, months, totalDue: Math.round(totalDue), paid: 0 }])}
                    >
                      Issue sample loan
                    </Btn>
                  </div>
                </Panel>
                <Panel title="Repayment schedule (flat interest)">
                  <DataTable
                    rows={schedule}
                    rowKey={(r) => String(r.n)}
                    columns={[
                      { header: "Month", cell: (r) => r.n },
                      { header: "Instalment", cell: (r) => rwf(r.instalment), align: "right" },
                      { header: "Balance after payment", cell: (r) => rwf(r.balance), align: "right" },
                    ]}
                  />
                </Panel>
              </div>
              <Panel title={`Loans (${loans.length})`}>
                <DataTable
                  rows={loans}
                  rowKey={(l) => l.id}
                  columns={[
                    { header: "Loan", cell: (l) => l.id },
                    { header: "Member", cell: (l) => <span className="font-semibold text-ink-900">{memberName(l.memberId)}</span> },
                    { header: "Principal", cell: (l) => rwf(l.principal), align: "right" },
                    { header: "Total due", cell: (l) => rwf(l.totalDue), align: "right" },
                    { header: "Paid", cell: (l) => rwf(l.paid), align: "right" },
                    { header: "Status", cell: (l) => (l.paid >= l.totalDue ? <Badge tone="green">Cleared</Badge> : <Badge tone="amber">Active</Badge>) },
                  ]}
                />
              </Panel>
            </div>
          ),
        },
        {
          id: "repayments",
          label: "Repayments",
          icon: HandCoins,
          render: () => (
            <div className="space-y-4">
              <Panel title="Active loans">
                <DataTable
                  rows={loans.filter((l) => l.paid < l.totalDue)}
                  rowKey={(l) => l.id}
                  empty="All loans are cleared."
                  columns={[
                    { header: "Loan", cell: (l) => l.id },
                    { header: "Member", cell: (l) => <span className="font-semibold text-ink-900">{memberName(l.memberId)}</span> },
                    { header: "Balance", cell: (l) => rwf(l.totalDue - l.paid), align: "right" },
                    {
                      header: "",
                      cell: (l) => (
                        <Btn
                          onClick={() => {
                            const amount = instalmentOf(l);
                            setLoans((list) => list.map((x) => (x.id === l.id ? { ...x, paid: x.paid + amount } : x)));
                            setRepayments((list) => [...list, { id: `R-${310 + list.length}`, loanId: l.id, amount, when: nowLabel() }]);
                          }}
                        >
                          Record {rwf(instalmentOf(l))}
                        </Btn>
                      ),
                      align: "right",
                    },
                  ]}
                />
              </Panel>
              <Panel title="Repayment records">
                <DataTable
                  rows={[...repayments].reverse()}
                  rowKey={(r) => r.id}
                  columns={[
                    { header: "Receipt", cell: (r) => r.id },
                    { header: "Loan", cell: (r) => r.loanId },
                    { header: "Member", cell: (r) => memberName(loans.find((l) => l.id === r.loanId)?.memberId ?? "") },
                    { header: "Date", cell: (r) => r.when },
                    { header: "Amount", cell: (r) => rwf(r.amount), align: "right" },
                  ]}
                />
              </Panel>
            </div>
          ),
        },
        {
          id: "reports",
          label: "Reports",
          icon: BarChart3,
          render: () => (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Savings" value={rwf(totalSavings)} />
                <Stat label="Loans issued" value={rwf(loans.reduce((s, l) => s + l.principal, 0))} />
                <Stat label="Repaid" value={rwf(loans.reduce((s, l) => s + l.paid, 0))} />
                <Stat label="Interest expected" value={rwf(loans.reduce((s, l) => s + (l.totalDue - l.principal), 0))} />
              </div>
              <Panel title="Member statement summary">
                <DataTable
                  rows={members}
                  rowKey={(m) => m.id}
                  columns={[
                    { header: "Member", cell: (m) => <span className="font-semibold text-ink-900">{m.name}</span> },
                    { header: "Savings", cell: (m) => rwf(m.savings), align: "right" },
                    { header: "Loan balance", cell: (m) => rwf(loans.filter((l) => l.memberId === m.id).reduce((s, l) => s + (l.totalDue - l.paid), 0)), align: "right" },
                    { header: "Net position", cell: (m) => rwf(m.savings - loans.filter((l) => l.memberId === m.id).reduce((s, l) => s + (l.totalDue - l.paid), 0)), align: "right" },
                  ]}
                />
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
              onChange={(k, v) => {
                setSettings((s) => ({ ...s, [k]: v }));
                if (k === "rate") setCalc((c) => ({ ...c, rate: v }));
                if (k === "share") setContrib((c) => ({ ...c, amount: v }));
              }}
              fields={[
                { key: "group", label: "Group name" },
                { key: "share", label: "Standard contribution (RWF)", type: "number" },
                { key: "rate", label: "Default loan interest (% per month)", type: "number" },
              ]}
              toggles={[
                { key: "sms", label: "SMS receipts to members", hint: "Simulated: no message is sent from this demo." },
                { key: "approval", label: "Loans need committee approval" },
              ]}
            />
          ),
        },
      ]}
    />
  );
}
