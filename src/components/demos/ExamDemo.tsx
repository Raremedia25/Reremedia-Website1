"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, FileQuestion, LayoutDashboard, Settings, Timer, Trophy, Users, XCircle } from "lucide-react";
import { Badge, BarChart, Btn, DataTable, DemoApp, Panel, SettingsPanel, Stat, num } from "./kit";
import type { DemoProps } from "./registry";

interface Question {
  id: string;
  topic: string;
  text: string;
  options: string[];
  answer: number;
}
interface Result {
  id: string;
  candidate: string;
  score: number;
  total: number;
  when: string;
  mine?: boolean;
}

const QUESTIONS: Question[] = [
  { id: "Q1", topic: "Numeracy", text: "A shop sells 24 items at 1,500 RWF each. What is the total?", options: ["30,000 RWF", "36,000 RWF", "38,500 RWF", "40,000 RWF"], answer: 1 },
  { id: "Q2", topic: "Numeracy", text: "What is 15% of 80,000 RWF?", options: ["8,000 RWF", "10,000 RWF", "12,000 RWF", "15,000 RWF"], answer: 2 },
  { id: "Q3", topic: "Logic", text: "Which number comes next: 3, 6, 12, 24, …?", options: ["30", "36", "48", "54"], answer: 2 },
  { id: "Q4", topic: "Logic", text: "All supervisors attend the Monday meeting. Alice is a supervisor. Therefore:", options: ["Alice attends the Monday meeting", "Alice chairs the meeting", "Only Alice attends", "Nothing can be concluded"], answer: 0 },
  { id: "Q5", topic: "Language", text: "Choose the correctly written sentence.", options: ["The reports was submitted yesterday.", "The reports were submitted yesterday.", "The reports is submitted yesterday.", "The reports be submitted yesterday."], answer: 1 },
  { id: "Q6", topic: "Language", text: "Which word is closest in meaning to \"accurate\"?", options: ["Quick", "Precise", "Late", "Expensive"], answer: 1 },
  { id: "Q7", topic: "Computer skills", text: "Which program is designed for working with spreadsheets?", options: ["A word processor", "A web browser", "Spreadsheet software", "A media player"], answer: 2 },
  { id: "Q8", topic: "Computer skills", text: "What is the safest way to handle a password?", options: ["Share it with a trusted colleague", "Write it on the monitor", "Use the same one everywhere", "Keep it private and unique"], answer: 3 },
  { id: "Q9", topic: "Workplace", text: "A customer is unhappy with a delay. What should you do first?", options: ["Ignore the complaint", "Listen and acknowledge the problem", "Blame another department", "Ask them to come back later"], answer: 1 },
  { id: "Q10", topic: "Workplace", text: "You notice an error in a report you already sent. You should:", options: ["Hope nobody sees it", "Delete the report", "Inform your supervisor and send a correction", "Wait until someone complains"], answer: 2 },
];
const RESULTS: Result[] = [
  { id: "A-501", candidate: "Sample Candidate 1", score: 9, total: 10, when: "14 Nov" },
  { id: "A-502", candidate: "Sample Candidate 2", score: 7, total: 10, when: "14 Nov" },
  { id: "A-503", candidate: "Sample Candidate 3", score: 5, total: 10, when: "15 Nov" },
  { id: "A-504", candidate: "Sample Candidate 4", score: 8, total: 10, when: "15 Nov" },
  { id: "A-505", candidate: "Sample Candidate 5", score: 4, total: 10, when: "16 Nov" },
];
const DEFAULT_SETTINGS = { title: "Sample Recruitment Examination", minutes: "5", pass: "60", shuffle: "off", review: "on" };

const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function ExamDemo({ initialScreen, skipLogin }: DemoProps) {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [results, setResults] = useState(RESULTS);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [paper, setPaper] = useState<Question[]>(QUESTIONS);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [lastScore, setLastScore] = useState(0);

  const passPct = Math.max(1, Math.min(100, Number(settings.pass) || 60));
  const duration = Math.max(1, Math.min(60, Math.floor(Number(settings.minutes) || 5)));
  const total = paper.length;
  const passed = (score: number, of: number) => (score / of) * 100 >= passPct;

  const submit = () => {
    const score = paper.filter((q) => answers[q.id] === q.answer).length;
    setLastScore(score);
    setPhase("done");
    setResults((list) => [...list, { id: `A-${501 + list.length}`, candidate: "You (demo attempt)", score, total: paper.length, when: "Today", mine: true }]);
  };

  // Count down while the exam is running; hand in automatically at zero.
  useEffect(() => {
    if (phase !== "running") return;
    if (seconds <= 0) {
      submit();
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, seconds]);

  const start = () => {
    const list = [...QUESTIONS];
    if (settings.shuffle === "on") list.sort(() => Math.random() - 0.5);
    setPaper(list);
    setAnswers({});
    setIndex(0);
    setSeconds(duration * 60);
    setPhase("running");
  };

  const reset = () => {
    setSettings(DEFAULT_SETTINGS);
    setResults(RESULTS);
    setPhase("idle");
    setAnswers({});
    setIndex(0);
  };

  const q = paper[Math.min(index, total - 1)];
  const answered = Object.keys(answers).length;
  const passCount = results.filter((r) => passed(r.score, r.total)).length;
  const distribution = [0, 1, 2, 3, 4].map((b) => ({ label: `${b * 20 + 1}-${b * 20 + 20}%`, value: results.filter((r) => Math.min(4, Math.floor(((r.score / r.total) * 100 - 1) / 20)) === b).length }));

  return (
    <DemoApp
      name="Recruitment Examination"
      tagline="Timed online tests with automatic marking, so every candidate is assessed on the same questions under the same conditions."
      accent="#4f46e5"
      role="Candidate / examiner"
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
                <Stat label="Candidates" value={num(results.length)} icon={Users} />
                <Stat label="Passed" value={num(passCount)} icon={Trophy} hint={`Pass mark ${passPct}%`} />
                <Stat label="Questions" value={num(QUESTIONS.length)} icon={FileQuestion} />
                <Stat label="Time allowed" value={`${duration} min`} icon={Timer} />
              </div>
              <Panel title="Score distribution">
                <BarChart data={distribution} />
              </Panel>
            </div>
          ),
        },
        {
          id: "exam",
          label: "Take the exam",
          icon: ClipboardList,
          render: () =>
            phase === "idle" ? (
              <Panel title={settings.title}>
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-700">
                  <li>{QUESTIONS.length} multiple-choice demonstration questions</li>
                  <li>
                    {duration} minutes; the exam is handed in automatically when time runs out
                  </li>
                  <li>Pass mark: {passPct}%</li>
                  <li>You can move between questions and change answers before submitting</li>
                </ul>
                <Btn className="mt-4" onClick={start}>
                  Start the sample exam
                </Btn>
                <p className="mt-3 text-xs text-ink-500">These are sample questions for demonstration. Your answers stay in your browser.</p>
              </Panel>
            ) : phase === "running" ? (
              <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                <Panel
                  title={`Question ${index + 1} of ${total}`}
                  action={
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold tabular-nums ${seconds <= 30 ? "bg-red-50 text-red-700" : "bg-indigo-50 text-indigo-700"}`} aria-live="off">
                      <Timer className="h-4 w-4" /> {clock(seconds)}
                    </span>
                  }
                >
                  <Badge tone="blue">{q.topic}</Badge>
                  <p className="mt-3 font-display text-lg font-bold leading-snug text-ink-900">{q.text}</p>
                  <div className="mt-4 space-y-2" role="radiogroup" aria-label={q.text}>
                    {q.options.map((opt, i) => {
                      const on = answers[q.id] === i;
                      return (
                        <button key={opt} type="button" role="radio" aria-checked={on} onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))} className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition-colors ${on ? "border-indigo-600 bg-indigo-50 font-semibold text-indigo-900" : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50"}`}>
                          <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-bold ${on ? "border-indigo-600 bg-indigo-600 text-white" : "border-ink-300 text-ink-500"}`}>{"ABCD"[i]}</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-5 flex flex-wrap justify-between gap-2">
                    <Btn variant="outline" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
                      Previous
                    </Btn>
                    {index < total - 1 ? <Btn onClick={() => setIndex((i) => i + 1)}>Next question</Btn> : <Btn onClick={submit}>Submit exam</Btn>}
                  </div>
                </Panel>
                <Panel title={`Answered ${answered} / ${total}`} className="lg:self-start">
                  <div className="grid grid-cols-5 gap-1.5">
                    {paper.map((p, i) => (
                      <button key={p.id} type="button" onClick={() => setIndex(i)} aria-label={`Go to question ${i + 1}`} className={`h-9 rounded-lg text-xs font-bold ${i === index ? "ring-2 ring-indigo-600 ring-offset-1" : ""} ${answers[p.id] !== undefined ? "bg-indigo-600 text-white" : "bg-ink-100 text-ink-700"}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <Btn variant="outline" className="mt-4 w-full" onClick={submit}>
                    Submit now
                  </Btn>
                </Panel>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`rounded-xl border p-5 ${passed(lastScore, total) ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                  <p className="text-sm font-semibold text-ink-700">Your sample result</p>
                  <p className="mt-1 font-display text-4xl font-extrabold text-ink-900">
                    {lastScore} / {total} <span className="text-xl font-bold text-ink-500">({Math.round((lastScore / total) * 100)}%)</span>
                  </p>
                  <p className={`mt-1 font-bold ${passed(lastScore, total) ? "text-emerald-700" : "text-red-700"}`}>{passed(lastScore, total) ? "Passed" : "Not passed"} · pass mark {passPct}%</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Btn onClick={start}>Try again</Btn>
                    <Btn variant="outline" onClick={() => setPhase("idle")}>
                      Back to instructions
                    </Btn>
                  </div>
                </div>
                {settings.review === "on" && (
                  <Panel title="Answer review">
                    <ol className="space-y-3">
                      {paper.map((p, i) => {
                        const ok = answers[p.id] === p.answer;
                        return (
                          <li key={p.id} className="flex gap-2.5 text-sm">
                            {ok ? <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-600" />}
                            <div>
                              <p className="font-semibold text-ink-900">
                                {i + 1}. {p.text}
                              </p>
                              <p className="text-ink-700">
                                Your answer: {answers[p.id] === undefined ? "not answered" : p.options[answers[p.id]]}
                                {!ok && <span className="text-emerald-700"> · Correct: {p.options[p.answer]}</span>}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </Panel>
                )}
              </div>
            ),
        },
        {
          id: "results",
          label: "Results",
          icon: Trophy,
          render: () => (
            <Panel title={`Results (${results.length})`}>
              <DataTable
                rows={[...results].sort((a, b) => b.score / b.total - a.score / a.total)}
                rowKey={(r) => r.id}
                columns={[
                  { header: "Attempt", cell: (r) => r.id },
                  { header: "Candidate", cell: (r) => <span className={r.mine ? "font-bold text-indigo-700" : "font-semibold text-ink-900"}>{r.candidate}</span> },
                  { header: "Date", cell: (r) => r.when },
                  { header: "Score", cell: (r) => `${r.score} / ${r.total}`, align: "right" },
                  { header: "%", cell: (r) => `${Math.round((r.score / r.total) * 100)}%`, align: "right" },
                  { header: "Outcome", cell: (r) => (passed(r.score, r.total) ? <Badge tone="green">Passed</Badge> : <Badge tone="red">Not passed</Badge>) },
                ]}
              />
            </Panel>
          ),
        },
        {
          id: "questions",
          label: "Question bank",
          icon: FileQuestion,
          render: () => (
            <Panel title={`Question bank (${QUESTIONS.length})`}>
              <DataTable
                rows={QUESTIONS}
                rowKey={(r) => r.id}
                columns={[
                  { header: "No.", cell: (r) => r.id },
                  { header: "Topic", cell: (r) => <Badge tone="blue">{r.topic}</Badge> },
                  { header: "Question", cell: (r) => <span className="text-ink-900">{r.text}</span> },
                  { header: "Options", cell: (r) => r.options.length, align: "right" },
                ]}
              />
              <p className="mt-3 text-xs text-ink-500">Correct answers are hidden here so the sample exam stays fair. Examiners see them in a real installation.</p>
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
                { key: "title", label: "Examination title" },
                { key: "minutes", label: "Time allowed (minutes)", type: "number" },
                { key: "pass", label: "Pass mark (%)", type: "number" },
              ]}
              toggles={[
                { key: "shuffle", label: "Shuffle question order", hint: "Applies the next time the exam is started." },
                { key: "review", label: "Show the answer review after submitting" },
              ]}
            />
          ),
        },
      ]}
    />
  );
}
