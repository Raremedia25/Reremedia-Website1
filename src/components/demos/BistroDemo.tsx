"use client";

import { useMemo, useState } from "react";
import { BarChart3, LayoutDashboard, Minus, Plus, Receipt as ReceiptIcon, Settings, UtensilsCrossed, BookOpen, Wallet, Armchair } from "lucide-react";
import { Badge, BarChart, Btn, DataTable, DemoApp, Modal, Panel, Receipt, SettingsPanel, ShareBars, Stat, inputCls, nowLabel, num, rwf, type ReceiptData } from "./kit";
import type { DemoProps } from "./registry";

interface Dish {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
}
interface Bill {
  id: string;
  table: string;
  when: string;
  lines: Array<{ name: string; category: string; qty: number; price: number }>;
  service: number;
  total: number;
  payment: string;
}

const MENU: Dish[] = [
  { id: "d1", name: "Vegetable soup", category: "Starters", price: 3000, available: true },
  { id: "d2", name: "Sambusa (3 pcs)", category: "Starters", price: 2500, available: true },
  { id: "d3", name: "Grilled tilapia", category: "Mains", price: 9000, available: true },
  { id: "d4", name: "Beef brochettes", category: "Mains", price: 6000, available: true },
  { id: "d5", name: "Chicken & chips", category: "Mains", price: 7500, available: true },
  { id: "d6", name: "Isombe with rice", category: "Mains", price: 5000, available: true },
  { id: "d7", name: "Fruit salad", category: "Desserts", price: 2500, available: true },
  { id: "d8", name: "African tea", category: "Drinks", price: 1500, available: true },
  { id: "d9", name: "Fresh passion juice", category: "Drinks", price: 2000, available: true },
  { id: "d10", name: "Soda 30cl", category: "Drinks", price: 1000, available: true },
  { id: "d11", name: "Mineral water", category: "Drinks", price: 1000, available: true },
];
const TABLES = ["T1", "T2", "T3", "T4", "T5", "T6", "Terrace 1", "Terrace 2"];
const OPEN_ORDERS: Record<string, Record<string, number>> = { T2: { d4: 2, d10: 2 }, "Terrace 1": { d3: 1, d9: 1 } };
const BILLS: Bill[] = [
  { id: "B-0207", table: "T4", when: "Today 12:35", payment: "Cash", service: 1600, total: 17600, lines: [{ name: "Grilled tilapia", category: "Mains", qty: 1, price: 9000 }, { name: "Isombe with rice", category: "Mains", qty: 1, price: 5000 }, { name: "Soda 30cl", category: "Drinks", qty: 2, price: 1000 }] },
  { id: "B-0208", table: "T1", when: "Today 13:10", payment: "Mobile Money", service: 1050, total: 11550, lines: [{ name: "Chicken & chips", category: "Mains", qty: 1, price: 7500 }, { name: "African tea", category: "Drinks", qty: 2, price: 1500 }] },
];
const HOURS = [
  { label: "11h", value: 24000 },
  { label: "12h", value: 68000 },
  { label: "13h", value: 91000 },
  { label: "14h", value: 47000 },
  { label: "18h", value: 52000 },
  { label: "19h", value: 104000 },
  { label: "20h", value: 88000 },
];
const DEFAULT_SETTINGS = { business: "Le Bistro Du Coin", service: "10", footer: "Murakoze! See you again.", kitchen: "on", split: "off" };

export default function BistroDemo({ initialScreen, skipLogin }: DemoProps) {
  const [menu, setMenu] = useState(MENU);
  const [orders, setOrders] = useState(OPEN_ORDERS);
  const [bills, setBills] = useState(BILLS);
  const [table, setTable] = useState("T3");
  const [category, setCategory] = useState("Mains");
  const [payment, setPayment] = useState("Cash");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [menuFilter, setMenuFilter] = useState("");

  const reset = () => {
    setMenu(MENU);
    setOrders(OPEN_ORDERS);
    setBills(BILLS);
    setTable("T3");
    setReceipt(null);
    setSettings(DEFAULT_SETTINGS);
  };

  const servicePct = Math.max(0, Math.min(30, Number(settings.service) || 0));
  const categories = useMemo(() => Array.from(new Set(menu.map((d) => d.category))), [menu]);
  const order = orders[table] ?? {};
  const lines = Object.entries(order)
    .map(([id, qty]) => ({ dish: menu.find((d) => d.id === id)!, qty }))
    .filter((l) => l.dish);
  const subtotal = lines.reduce((s, l) => s + l.qty * l.dish.price, 0);
  const service = Math.round((subtotal * servicePct) / 100);
  const total = subtotal + service;
  const revenue = bills.reduce((s, b) => s + b.total, 0);
  const openTables = Object.keys(orders).filter((t) => Object.keys(orders[t]).length > 0);

  const setQty = (id: string, qty: number) =>
    setOrders((all) => {
      const current = { ...(all[table] ?? {}) };
      if (qty <= 0) delete current[id];
      else current[id] = Math.min(20, qty);
      return { ...all, [table]: current };
    });

  const toReceipt = (b: Bill): ReceiptData => ({ business: settings.business, subtitle: `Table ${b.table}`, number: b.id, when: b.when, lines: b.lines, extras: [{ label: "Service charge", amount: b.service }], total: b.total, payment: b.payment, footer: settings.footer });

  const settle = () => {
    if (lines.length === 0) return;
    const bill: Bill = { id: `B-${String(207 + bills.length).padStart(4, "0")}`, table, when: nowLabel(), payment, service, total, lines: lines.map((l) => ({ name: l.dish.name, category: l.dish.category, qty: l.qty, price: l.dish.price })) };
    setBills((list) => [...list, bill]);
    setOrders((all) => ({ ...all, [table]: {} }));
    setReceipt(toReceipt(bill));
  };

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of bills) for (const l of b.lines) map.set(l.category, (map.get(l.category) ?? 0) + l.qty * l.price);
    return [...map].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [bills]);
  const topDishes = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of bills) for (const l of b.lines) map.set(l.name, (map.get(l.name) ?? 0) + l.qty);
    return [...map].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [bills]);

  return (
    <>
      <DemoApp
        name="Le Bistro Du Coin"
        tagline="Tables, orders, bills and receipts for a restaurant and bar, from the first drink to the final payment."
        accent="#d97706"
        role="Waiter"
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
                  <Stat label="Sales today" value={rwf(revenue)} icon={Wallet} />
                  <Stat label="Bills settled" value={num(bills.length)} icon={ReceiptIcon} />
                  <Stat label="Open tables" value={`${openTables.length} / ${TABLES.length}`} icon={Armchair} />
                  <Stat label="Average bill" value={rwf(bills.length ? revenue / bills.length : 0)} icon={BarChart3} />
                </div>
                <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                  <Panel title="Sales by hour (sample)">
                    <BarChart data={HOURS} format={(n) => `${Math.round(n / 1000)}k`} />
                  </Panel>
                  <Panel title="Open orders">
                    {openTables.length === 0 ? (
                      <p className="text-sm text-ink-500">No open orders.</p>
                    ) : (
                      <ul className="space-y-2">
                        {openTables.map((t) => (
                          <li key={t} className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-ink-900">Table {t}</span>
                            <Badge tone="amber">{Object.values(orders[t]).reduce((a, b) => a + b, 0)} items</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Panel>
                </div>
              </div>
            ),
          },
          {
            id: "orders",
            label: "Tables & orders",
            icon: UtensilsCrossed,
            render: () => (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {TABLES.map((t) => {
                    const busy = Object.keys(orders[t] ?? {}).length > 0;
                    return (
                      <button key={t} type="button" onClick={() => setTable(t)} aria-pressed={table === t} className={`rounded-xl border-2 px-1 py-2.5 text-center text-xs font-bold transition-colors ${table === t ? "border-amber-600 bg-amber-600 text-white" : busy ? "border-amber-300 bg-amber-50 text-amber-900" : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50"}`}>
                        {t}
                        <span className="block text-[10px] font-medium opacity-80">{busy ? "Occupied" : "Free"}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                  <div>
                    <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
                      {categories.map((c) => (
                        <button key={c} type="button" onClick={() => setCategory(c)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${category === c ? "border-amber-600 bg-amber-600 text-white" : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50"}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                    <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {menu
                        .filter((d) => d.category === category)
                        .map((d) => (
                          <li key={d.id}>
                            <button type="button" disabled={!d.available} onClick={() => setQty(d.id, (order[d.id] ?? 0) + 1)} className="flex h-full w-full flex-col rounded-xl border border-ink-200 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-card disabled:cursor-not-allowed disabled:opacity-50">
                              <span className="text-sm font-semibold leading-snug text-ink-900">{d.name}</span>
                              <span className="mt-auto pt-2 text-sm font-bold text-amber-700">{rwf(d.price)}</span>
                              {!d.available && <span className="text-[11px] text-red-600">Not available</span>}
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                  <Panel title={`Order · Table ${table}`} className="lg:self-start">
                    {lines.length === 0 ? (
                      <p className="py-6 text-center text-sm text-ink-500">Tap a dish or drink to add it to this table.</p>
                    ) : (
                      <ul className="space-y-3">
                        {lines.map((l) => (
                          <li key={l.dish.id} className="text-sm">
                            <div className="flex justify-between gap-2">
                              <span className="font-semibold text-ink-900">{l.dish.name}</span>
                              <span className="tabular-nums">{num(l.qty * l.dish.price)}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5">
                              <button type="button" onClick={() => setQty(l.dish.id, l.qty - 1)} className="grid h-7 w-7 place-items-center rounded-md border border-ink-200 hover:bg-ink-50" aria-label={`Decrease ${l.dish.name}`}>
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-7 text-center font-semibold tabular-nums">{l.qty}</span>
                              <button type="button" onClick={() => setQty(l.dish.id, l.qty + 1)} className="grid h-7 w-7 place-items-center rounded-md border border-ink-200 hover:bg-ink-50" aria-label={`Increase ${l.dish.name}`}>
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                              <span className="text-xs text-ink-500">x {num(l.dish.price)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <dl className="mt-4 space-y-1 border-t border-ink-200 pt-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-ink-500">Subtotal</dt>
                        <dd className="tabular-nums">{rwf(subtotal)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-ink-500">Service charge ({servicePct}%)</dt>
                        <dd className="tabular-nums">{rwf(service)}</dd>
                      </div>
                      <div className="flex justify-between font-display text-lg font-bold text-ink-900">
                        <dt>Bill total</dt>
                        <dd className="tabular-nums">{rwf(total)}</dd>
                      </div>
                    </dl>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {["Cash", "Mobile Money"].map((m) => (
                        <button key={m} type="button" onClick={() => setPayment(m)} aria-pressed={payment === m} className={`rounded-lg border px-2 py-2 text-xs font-semibold ${payment === m ? "border-amber-600 bg-amber-50 text-amber-900" : "border-ink-200 text-ink-700 hover:bg-ink-50"}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                    <Btn className="mt-3 w-full" onClick={settle} disabled={lines.length === 0}>
                      Settle bill (simulated)
                    </Btn>
                  </Panel>
                </div>
              </div>
            ),
          },
          {
            id: "menu",
            label: "Menu",
            icon: BookOpen,
            render: () => (
              <Panel title={`Menu items (${menu.length})`} action={<input className={`${inputCls} w-44`} placeholder="Filter…" value={menuFilter} onChange={(e) => setMenuFilter(e.target.value)} aria-label="Filter menu" />}>
                <DataTable
                  rows={menu.filter((d) => d.name.toLowerCase().includes(menuFilter.toLowerCase()))}
                  rowKey={(d) => d.id}
                  columns={[
                    { header: "Item", cell: (d) => <span className="font-semibold text-ink-900">{d.name}</span> },
                    { header: "Category", cell: (d) => d.category },
                    { header: "Price", cell: (d) => rwf(d.price), align: "right" },
                    { header: "Status", cell: (d) => (d.available ? <Badge tone="green">Available</Badge> : <Badge tone="red">Off the menu</Badge>) },
                    {
                      header: "",
                      cell: (d) => (
                        <Btn variant="outline" onClick={() => setMenu((list) => list.map((x) => (x.id === d.id ? { ...x, available: !x.available } : x)))}>
                          {d.available ? "Mark unavailable" : "Make available"}
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
            id: "bills",
            label: "Bills",
            icon: ReceiptIcon,
            render: () => (
              <Panel title={`Settled bills (${bills.length})`}>
                <DataTable
                  rows={[...bills].reverse()}
                  rowKey={(b) => b.id}
                  columns={[
                    { header: "Bill", cell: (b) => <span className="font-semibold text-ink-900">{b.id}</span> },
                    { header: "Table", cell: (b) => b.table },
                    { header: "Time", cell: (b) => b.when },
                    { header: "Payment", cell: (b) => <Badge tone={b.payment === "Cash" ? "green" : "blue"}>{b.payment}</Badge> },
                    { header: "Total", cell: (b) => rwf(b.total), align: "right" },
                    {
                      header: "",
                      cell: (b) => (
                        <Btn variant="outline" onClick={() => setReceipt(toReceipt(b))}>
                          Receipt
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
            id: "reports",
            label: "Reports",
            icon: BarChart3,
            render: () => (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  <Stat label="Sales today" value={rwf(revenue)} />
                  <Stat label="Service charge collected" value={rwf(bills.reduce((s, b) => s + b.service, 0))} />
                  <Stat label="Items served" value={num(bills.reduce((s, b) => s + b.lines.reduce((a, l) => a + l.qty, 0), 0))} />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Panel title="Sales by menu category">
                    <ShareBars data={byCategory} format={rwf} />
                  </Panel>
                  <Panel title="Most ordered">
                    <ShareBars data={topDishes} />
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
                  { key: "business", label: "Restaurant name (printed on receipts)" },
                  { key: "service", label: "Service charge (%)", type: "number" },
                  { key: "footer", label: "Receipt footer message" },
                ]}
                toggles={[
                  { key: "kitchen", label: "Send orders to the kitchen printer", hint: "Simulated in this demo." },
                  { key: "split", label: "Allow split bills" },
                ]}
              />
            ),
          },
        ]}
      />
      {receipt && (
        <Modal title="Sample receipt" onClose={() => setReceipt(null)} footer={<Btn onClick={() => setReceipt(null)}>Done</Btn>}>
          <Receipt data={receipt} />
        </Modal>
      )}
    </>
  );
}
