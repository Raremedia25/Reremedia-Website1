"use client";

import { useMemo, useState } from "react";
import { BarChart3, Bike, CalendarCheck, Car, LayoutDashboard, MapPinned, Route, Settings, Wallet } from "lucide-react";
import { Badge, BarChart, Btn, DataTable, DemoApp, FieldRow, Panel, SettingsPanel, ShareBars, Stat, inputCls, nowLabel, num, rwf } from "./kit";
import type { DemoProps } from "./registry";

type VehicleType = "Car" | "Motorcycle";
interface Vehicle {
  id: string;
  type: VehicleType;
  model: string;
  plate: string;
  driver: string;
  seats: number;
  status: "Available" | "On trip" | "Maintenance";
}
interface Booking {
  id: string;
  passenger: string;
  from: string;
  to: string;
  vehicleId: string;
  km: number;
  fare: number;
  when: string;
  status: "Assigned" | "On trip" | "Completed";
}

// Schematic map of sample pick-up points. Positions are illustrative, not surveyed.
const PLACES: Record<string, [number, number]> = {
  Nyabugogo: [90, 110],
  "City Centre": [170, 190],
  Nyamirambo: [110, 300],
  Kacyiru: [290, 110],
  Kimihurura: [300, 215],
  Gikondo: [250, 310],
  Remera: [420, 170],
  Kimironko: [480, 80],
  Kicukiro: [400, 300],
  Airport: [540, 230],
};
const ROADS: Array<[string, string]> = [
  ["Nyabugogo", "City Centre"],
  ["Nyabugogo", "Kacyiru"],
  ["City Centre", "Nyamirambo"],
  ["City Centre", "Kimihurura"],
  ["City Centre", "Gikondo"],
  ["Kacyiru", "Kimihurura"],
  ["Kacyiru", "Kimironko"],
  ["Kimihurura", "Remera"],
  ["Kimihurura", "Gikondo"],
  ["Gikondo", "Kicukiro"],
  ["Remera", "Kimironko"],
  ["Remera", "Airport"],
  ["Remera", "Kicukiro"],
  ["Kicukiro", "Airport"],
];
const KM_PER_UNIT = 0.028;
const dist = (a: string, b: string) => Math.hypot(PLACES[a][0] - PLACES[b][0], PLACES[a][1] - PLACES[b][1]) * KM_PER_UNIT;

/** Shortest path over the sample road network (Dijkstra on ten nodes). */
function findRoute(from: string, to: string): { path: string[]; km: number } {
  const names = Object.keys(PLACES);
  const best: Record<string, number> = Object.fromEntries(names.map((n) => [n, Infinity]));
  const prev: Record<string, string | null> = {};
  const todo = new Set(names);
  best[from] = 0;
  while (todo.size) {
    let u = "";
    for (const n of todo) if (u === "" || best[n] < best[u]) u = n;
    todo.delete(u);
    if (u === to) break;
    for (const [a, b] of ROADS) {
      const v = a === u ? b : b === u ? a : null;
      if (!v || !todo.has(v)) continue;
      const d = best[u] + dist(u, v);
      if (d < best[v]) {
        best[v] = d;
        prev[v] = u;
      }
    }
  }
  const path = [to];
  while (path[0] !== from && prev[path[0]]) path.unshift(prev[path[0]]!);
  return { path, km: best[to] };
}

const VEHICLES: Vehicle[] = [
  { id: "V-01", type: "Car", model: "Sedan", plate: "RAX 001 S", driver: "Sample Driver A", seats: 4, status: "Available" },
  { id: "V-02", type: "Car", model: "SUV", plate: "RAX 002 S", driver: "Sample Driver B", seats: 6, status: "Available" },
  { id: "V-03", type: "Car", model: "Minivan", plate: "RAX 003 S", driver: "Sample Driver C", seats: 7, status: "Maintenance" },
  { id: "V-04", type: "Motorcycle", model: "Moto 125cc", plate: "RM 004 S", driver: "Sample Rider D", seats: 1, status: "Available" },
  { id: "V-05", type: "Motorcycle", model: "Moto 150cc", plate: "RM 005 S", driver: "Sample Rider E", seats: 1, status: "On trip" },
  { id: "V-06", type: "Motorcycle", model: "Moto 125cc", plate: "RM 006 S", driver: "Sample Rider F", seats: 1, status: "Available" },
];
const BOOKINGS: Booking[] = [
  { id: "UM-3301", passenger: "Sample Passenger 1", from: "Nyabugogo", to: "Remera", vehicleId: "V-01", km: 10.6, fare: 8900, when: "Today 08:15", status: "Completed" },
  { id: "UM-3302", passenger: "Sample Passenger 2", from: "Kimironko", to: "City Centre", vehicleId: "V-05", km: 11.2, fare: 3900, when: "Today 10:40", status: "On trip" },
];
const WEEK = [
  { label: "Mon", value: 41 },
  { label: "Tue", value: 37 },
  { label: "Wed", value: 52 },
  { label: "Thu", value: 48 },
  { label: "Fri", value: 66 },
  { label: "Sat", value: 71 },
];
const DEFAULT_SETTINGS = { company: "UMUSARE Transport", carBase: "1500", carKm: "700", motoBase: "500", motoKm: "300", sms: "on", cash: "on" };

function RouteMap({ path }: { path: string[] }) {
  const points = path.map((p) => PLACES[p].join(",")).join(" ");
  return (
    <svg viewBox="0 0 620 380" className="h-auto w-full rounded-lg border border-ink-200 bg-[#eef6f1]" role="img" aria-label={`Sample map showing the route ${path.join(" to ")}`}>
      <path d="M0 250 C 120 230 180 350 330 345 S 560 330 620 360 V380 H0Z" fill="#dbeafe" />
      <circle cx="210" cy="70" r="46" fill="#d1fae5" />
      <circle cx="520" cy="320" r="38" fill="#d1fae5" />
      {ROADS.map(([a, b]) => (
        <line key={a + b} x1={PLACES[a][0]} y1={PLACES[a][1]} x2={PLACES[b][0]} y2={PLACES[b][1]} stroke="#ffffff" strokeWidth="9" strokeLinecap="round" />
      ))}
      {ROADS.map(([a, b]) => (
        <line key={`${a + b}c`} x1={PLACES[a][0]} y1={PLACES[a][1]} x2={PLACES[b][0]} y2={PLACES[b][1]} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="6 6" />
      ))}
      {path.length > 1 && <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />}
      {Object.entries(PLACES).map(([name, [x, y]]) => {
        const start = name === path[0];
        const end = name === path[path.length - 1];
        const on = path.includes(name);
        return (
          <g key={name}>
            <circle cx={x} cy={y} r={start || end ? 10 : 6} fill={start ? "#16a34a" : end ? "#dc2626" : on ? "#2563eb" : "#64748b"} stroke="#fff" strokeWidth="2.5" />
            <text x={x} y={y - 15} textAnchor="middle" fontSize="13" fontWeight={on ? 700 : 500} fill="#0f172a" stroke="#eef6f1" strokeWidth="3" paintOrder="stroke">
              {name}
            </text>
          </g>
        );
      })}
      <text x="12" y="368" fontSize="11" fill="#475569">
        Schematic sample map · not to scale
      </text>
    </svg>
  );
}

export default function TransportDemo({ initialScreen, skipLogin }: DemoProps) {
  const [vehicles, setVehicles] = useState(VEHICLES);
  const [bookings, setBookings] = useState(BOOKINGS);
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [form, setForm] = useState({ passenger: "", from: "Nyabugogo", to: "Airport", type: "Car" as VehicleType });
  const [last, setLast] = useState<Booking | null>(null);

  const reset = () => {
    setVehicles(VEHICLES);
    setBookings(BOOKINGS);
    setSettings(DEFAULT_SETTINGS);
    setLast(null);
  };

  const route = useMemo(() => findRoute(form.from, form.to), [form.from, form.to]);
  const fareFor = (type: VehicleType, km: number) => {
    const base = Number(type === "Car" ? settings.carBase : settings.motoBase) || 0;
    const perKm = Number(type === "Car" ? settings.carKm : settings.motoKm) || 0;
    return Math.round((base + perKm * km) / 100) * 100;
  };
  const free = vehicles.filter((v) => v.type === form.type && v.status === "Available");
  const minutes = Math.round((route.km / (form.type === "Car" ? 28 : 34)) * 60);
  const vehicleOf = (id: string) => vehicles.find((v) => v.id === id);
  const revenue = bookings.reduce((s, b) => s + b.fare, 0);
  const sameStop = form.from === form.to;

  const book = () => {
    const vehicle = free[0];
    if (!vehicle || sameStop) return;
    const booking: Booking = { id: `UM-${3301 + bookings.length}`, passenger: form.passenger.trim().slice(0, 40) || "Sample Passenger", from: form.from, to: form.to, vehicleId: vehicle.id, km: Math.round(route.km * 10) / 10, fare: fareFor(form.type, route.km), when: nowLabel(), status: "Assigned" };
    setBookings((list) => [...list, booking]);
    setVehicles((list) => list.map((v) => (v.id === vehicle.id ? { ...v, status: "On trip" } : v)));
    setLast(booking);
  };

  const advance = (b: Booking) => {
    const next = b.status === "Assigned" ? "On trip" : "Completed";
    setBookings((list) => list.map((x) => (x.id === b.id ? { ...x, status: next } : x)));
    if (next === "Completed") setVehicles((list) => list.map((v) => (v.id === b.vehicleId ? { ...v, status: "Available" } : v)));
  };

  const tone = (s: string) => (s === "Available" || s === "Completed" ? "green" : s === "Maintenance" ? "red" : s === "Assigned" ? "amber" : "blue");

  return (
    <DemoApp
      name="UMUSARE Transport"
      tagline="Book a car or a motorcycle, see the fare before you travel and follow every trip from request to arrival."
      accent="#2563eb"
      role="Dispatcher"
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
                <Stat label="Trips today" value={num(bookings.length)} icon={Route} />
                <Stat label="Vehicles available" value={`${vehicles.filter((v) => v.status === "Available").length} / ${vehicles.length}`} icon={Car} />
                <Stat label="On the road" value={num(bookings.filter((b) => b.status !== "Completed").length)} icon={MapPinned} />
                <Stat label="Fares today" value={rwf(revenue)} icon={Wallet} />
              </div>
              <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                <Panel title="Trips per day (sample)">
                  <BarChart data={[...WEEK, { label: "Today", value: bookings.length }]} />
                </Panel>
                <Panel title="Fleet status">
                  <ShareBars data={(["Available", "On trip", "Maintenance"] as const).map((s) => ({ label: s, value: vehicles.filter((v) => v.status === s).length }))} />
                </Panel>
              </div>
            </div>
          ),
        },
        {
          id: "book",
          label: "Book a trip",
          icon: CalendarCheck,
          render: () => (
            <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
              <Panel title="Trip details">
                <div className="space-y-3">
                  <FieldRow label="Passenger name" htmlFor="tr-name">
                    <input id="tr-name" className={inputCls} value={form.passenger} onChange={(e) => setForm({ ...form, passenger: e.target.value })} placeholder="Type a sample name" maxLength={40} />
                  </FieldRow>
                  <FieldRow label="Pick-up" htmlFor="tr-from">
                    <select id="tr-from" className={inputCls} value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })}>
                      {Object.keys(PLACES).map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </FieldRow>
                  <FieldRow label="Destination" htmlFor="tr-to">
                    <select id="tr-to" className={inputCls} value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })}>
                      {Object.keys(PLACES).map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </FieldRow>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Car", "Motorcycle"] as const).map((t) => (
                      <button key={t} type="button" onClick={() => setForm({ ...form, type: t })} aria-pressed={form.type === t} className={`rounded-xl border-2 p-2.5 text-left ${form.type === t ? "border-blue-600 bg-blue-50" : "border-ink-200 bg-white hover:bg-ink-50"}`}>
                        {t === "Car" ? <Car className="h-5 w-5 text-blue-700" /> : <Bike className="h-5 w-5 text-blue-700" />}
                        <span className="mt-1 block text-sm font-bold text-ink-900">{t}</span>
                        <span className="block text-xs tabular-nums text-ink-500">{sameStop ? "—" : rwf(fareFor(t, route.km))}</span>
                      </button>
                    ))}
                  </div>
                  <dl className="space-y-1 rounded-lg bg-blue-50 p-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ink-700">Distance</dt>
                      <dd className="font-semibold tabular-nums">{sameStop ? "—" : `${route.km.toFixed(1)} km`}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-700">Estimated time</dt>
                      <dd className="font-semibold tabular-nums">{sameStop ? "—" : `${minutes} min`}</dd>
                    </div>
                    <div className="flex justify-between font-display text-base font-bold">
                      <dt>Fare estimate</dt>
                      <dd className="tabular-nums text-blue-700">{sameStop ? "—" : rwf(fareFor(form.type, route.km))}</dd>
                    </div>
                  </dl>
                  <Btn className="w-full" onClick={book} disabled={sameStop || free.length === 0}>
                    Confirm simulated booking
                  </Btn>
                  <p className={`text-xs ${free.length === 0 || sameStop ? "font-semibold text-red-600" : "text-ink-500"}`}>{sameStop ? "Choose a destination different from the pick-up point." : free.length === 0 ? `No ${form.type.toLowerCase()} is available right now. Complete a trip under Bookings to free one.` : `${free.length} ${form.type.toLowerCase()}${free.length === 1 ? "" : "s"} available nearby.`}</p>
                </div>
              </Panel>
              <div className="space-y-3">
                <RouteMap path={sameStop ? [form.from] : route.path} />
                {!sameStop && (
                  <p className="text-sm text-ink-700">
                    <span className="font-semibold text-ink-900">Route:</span> {route.path.join(" → ")}
                  </p>
                )}
                {last && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                    <p className="font-bold">
                      Booking {last.id} confirmed (simulated)
                    </p>
                    <p>
                      {vehicleOf(last.vehicleId)?.driver} is assigned with {vehicleOf(last.vehicleId)?.model} {vehicleOf(last.vehicleId)?.plate}. {last.from} → {last.to}, {last.km} km, {rwf(last.fare)}. No driver was actually dispatched.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ),
        },
        {
          id: "vehicles",
          label: "Vehicles",
          icon: Car,
          render: () => (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((v) => (
                <li key={v.id} className="rounded-xl border border-ink-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700">{v.type === "Car" ? <Car className="h-5 w-5" /> : <Bike className="h-5 w-5" />}</span>
                    <Badge tone={tone(v.status)}>{v.status}</Badge>
                  </div>
                  <p className="mt-3 font-display font-bold text-ink-900">{v.model}</p>
                  <p className="text-sm text-ink-500">
                    {v.plate} · {v.seats} seat{v.seats === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1 text-sm text-ink-700">{v.driver}</p>
                  {v.status !== "On trip" && (
                    <Btn variant="outline" className="mt-3 w-full" onClick={() => setVehicles((list) => list.map((x) => (x.id === v.id ? { ...x, status: x.status === "Available" ? "Maintenance" : "Available" } : x)))}>
                      {v.status === "Available" ? "Send to maintenance" : "Return to service"}
                    </Btn>
                  )}
                </li>
              ))}
            </ul>
          ),
        },
        {
          id: "bookings",
          label: "Bookings",
          icon: Route,
          render: () => (
            <Panel title={`Bookings (${bookings.length})`}>
              <DataTable
                rows={[...bookings].reverse()}
                rowKey={(b) => b.id}
                columns={[
                  { header: "Booking", cell: (b) => <span className="font-semibold text-ink-900">{b.id}</span> },
                  { header: "Passenger", cell: (b) => b.passenger },
                  { header: "Trip", cell: (b) => `${b.from} → ${b.to}` },
                  { header: "Vehicle", cell: (b) => vehicleOf(b.vehicleId)?.plate ?? b.vehicleId },
                  { header: "Fare", cell: (b) => rwf(b.fare), align: "right" },
                  { header: "Status", cell: (b) => <Badge tone={tone(b.status)}>{b.status}</Badge> },
                  { header: "", cell: (b) => (b.status === "Completed" ? null : <Btn onClick={() => advance(b)}>{b.status === "Assigned" ? "Start trip" : "Complete trip"}</Btn>), align: "right" },
                ]}
              />
            </Panel>
          ),
        },
        {
          id: "reports",
          label: "Reports",
          icon: BarChart3,
          render: () => (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                <Stat label="Fares today" value={rwf(revenue)} />
                <Stat label="Distance covered" value={`${bookings.reduce((s, b) => s + b.km, 0).toFixed(1)} km`} />
                <Stat label="Average fare" value={rwf(bookings.length ? revenue / bookings.length : 0)} />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Fares by vehicle type">
                  <ShareBars data={(["Car", "Motorcycle"] as const).map((t) => ({ label: t, value: bookings.filter((b) => vehicleOf(b.vehicleId)?.type === t).reduce((s, b) => s + b.fare, 0) }))} format={rwf} />
                </Panel>
                <Panel title="Trips by driver">
                  <ShareBars data={vehicles.map((v) => ({ label: v.driver, value: bookings.filter((b) => b.vehicleId === v.id).length })).filter((d) => d.value > 0)} />
                </Panel>
              </div>
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
                { key: "company", label: "Company name" },
                { key: "carBase", label: "Car base fare (RWF)", type: "number" },
                { key: "carKm", label: "Car fare per km (RWF)", type: "number" },
                { key: "motoBase", label: "Motorcycle base fare (RWF)", type: "number" },
                { key: "motoKm", label: "Motorcycle fare per km (RWF)", type: "number" },
              ]}
              toggles={[
                { key: "sms", label: "SMS confirmation to passengers", hint: "Simulated: no message is sent from this demo." },
                { key: "cash", label: "Accept cash on arrival" },
              ]}
            />
          ),
        },
      ]}
    />
  );
}
