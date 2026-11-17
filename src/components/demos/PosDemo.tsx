"use client";

import { useMemo, useState } from "react";
import { BarChart3, Boxes, LayoutDashboard, Minus, Plus, Receipt as ReceiptIcon, Search, Settings, ShoppingCart, Trash2, TrendingUp, TriangleAlert, Wallet } from "lucide-react";
import { Badge, BarChart, Btn, DataTable, DemoApp, FieldRow, Modal, Panel, Receipt, SettingsPanel, ShareBars, Stat, inputCls, nowLabel, num, rwf, type ReceiptData } from "./kit";
import type { DemoProps } from "./registry";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}
interface Sale {
  id: string;
  when: string;
  lines: Array<{ name: string; category: string; qty: number; price: number }>;
  total: number;
  payment: string;
}

const PRODUCTS: Product[] = [
  { id: "p1", name: "Sugar 1kg", category: "Groceries", price: 1800, stock: 42 },
  { id: "p2", name: "Rice 5kg", category: "Groceries", price: 9500, stock: 18 },
  { id: "p3", name: "Cooking oil 1L", category: "Groceries", price: 3200, stock: 25 },
  { id: "p4", name: "Milk 500ml", category: "Drinks", price: 700, stock: 60 },
  { id: "p5", name: "Mineral water 1.5L", category: "Drinks", price: 800, stock: 48 },
  { id: "p6", name: "Fruit juice 1L", category: "Drinks", price: 2500, stock: 4 },
  { id: "p7", name: "Bath soap", category: "Household", price: 900, stock: 33 },
  { id: "p8", name: "Washing powder 1kg", category: "Household", price: 2800, stock: 3 },
  { id: "p9", name: "Phone charger", category: "Electronics", price: 6000, stock: 12 },
  { id: "p10", name: "Earphones", category: "Electronics", price: 4500, stock: 9 },
  { id: "p11", name: "Notebook A4", category: "Stationery", price: 1200, stock: 55 },
  { id: "p12", name: "Ballpoint pens (5)", category: "Stationery", price: 1000, stock: 70 },
];

const SALES: Sale[] = [
  { id: "S-1041", when: "Today 09:12", payment: "Cash", total: 12100, lines: [{ name: "Rice 5kg", category: "Groceries", qty: 1, price: 9500 }, { name: "Sugar 1kg", category: "Groceries", qty: 1, price: 1800 }, { name: "Mineral water 1.5L", category: "Drinks", qty: 1, price: 800 }] },
  { id: "S-1042", when: "Today 10:03", payment: "Mobile Money", total: 10500, lines: [{ name: "Phone charger", category: "Electronics", qty: 1, price: 6000 }, { name: "Earphones", category: "Electronics", qty: 1, price: 4500 }] },
  { id: "S-1043", when: "Today 11:40", payment: "Cash", total: 5600, lines: [{ name: "Washing powder 1kg", category: "Household", qty: 2, price: 2800 }] },
];

const WEEK = [
  { label: "Mon", value: 186000 },
  { label: "Tue", value: 142500 },
  { label: "Wed", value: 205300 },
  { label: "Thu", value: 171800 },
  { label: "Fri", value: 248900 },
  { label: "Sat", value: 301200 },
];

const DEFAULT_SETTINGS = { business: "Sample Shop Ltd", footer: "Thank you for shopping with us!", lowStock: "5", printReceipt: "on", offline: "on" };

export default function PosDemo({ initialScreen, skipLogin }: DemoProps) {
  const [products, setProducts] = useState(PRODUCTS);
  const [sales, setSales] = useState(SALES);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("Cash");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [draft, setDraft] = useState({ name: "", category: "Groceries", price: "", stock: "" });

  const reset = () => {
    setProducts(PRODUCTS);
    setSales(SALES);
    setCart({});
    setCategory("All");
    setQuery("");
    setReceipt(null);
    setSettings(DEFAULT_SETTINGS);
  };

  const lowLimit = Number(settings.lowStock) || 5;
  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category)))], [products]);
  const visible = products.filter((p) => (category === "All" || p.category === category) && p.name.toLowerCase().includes(query.trim().toLowerCase()));
  const cartLines = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find((p) => p.id === id)!, qty }))
    .filter((l) => l.product);
  const cartTotal = cartLines.reduce((s, l) => s + l.qty * l.product.price, 0);
  const todayTotal = sales.reduce((s, x) => s + x.total, 0);
  const itemsSold = sales.reduce((s, x) => s + x.lines.reduce((a, l) => a + l.qty, 0), 0);
  const lowStock = products.filter((p) => p.stock <= lowLimit);

  const setQty = (id: string, qty: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const next = Math.max(0, Math.min(product.stock, qty));
    setCart((c) => {
      const copy = { ...c };
      if (next === 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  };

  const completeSale = () => {
    if (cartLines.length === 0) return;
    const id = `S-${1041 + sales.length}`;
    const lines = cartLines.map((l) => ({ name: l.product.name, category: l.product.category, qty: l.qty, price: l.product.price }));
    setSales((s) => [...s, { id, when: nowLabel(), lines, total: cartTotal, payment }]);
    setProducts((list) => list.map((p) => (cart[p.id] ? { ...p, stock: p.stock - cart[p.id] } : p)));
    setReceipt({ business: settings.business, subtitle: "Raremedia POS demo", number: id, when: nowLabel(), lines, total: cartTotal, payment, footer: settings.footer });
    setCart({});
  };

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sales) for (const l of s.lines) map.set(l.category, (map.get(l.category) ?? 0) + l.qty * l.price);
    return [...map].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [sales]);
  const topProducts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sales) for (const l of s.lines) map.set(l.name, (map.get(l.name) ?? 0) + l.qty);
    return [...map].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [sales]);

  const salesTable = (rows: Sale[]) => (
    <DataTable
      rows={rows}
      rowKey={(r) => r.id}
      columns={[
        { header: "Receipt", cell: (r) => <span className="font-semibold text-ink-900">{r.id}</span> },
        { header: "Time", cell: (r) => r.when },
        { header: "Items", cell: (r) => r.lines.reduce((a, l) => a + l.qty, 0), align: "right" },
        { header: "Payment", cell: (r) => <Badge tone={r.payment === "Cash" ? "green" : "blue"}>{r.payment}</Badge> },
        { header: "Total", cell: (r) => rwf(r.total), align: "right" },
        {
          header: "",
          cell: (r) => (
            <Btn variant="outline" onClick={() => setReceipt({ business: settings.business, subtitle: "Raremedia POS demo", number: r.id, when: r.when, lines: r.lines, total: r.total, payment: r.payment, footer: settings.footer })}>
              <ReceiptIcon className="h-3.5 w-3.5" /> Receipt
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
        name="Raremedia POS"
        tagline="Sell at the counter, keep stock accurate and see the day's numbers on one screen."
        accent="#0891b2"
        role="Cashier"
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
                  <Stat label="Today's sales" value={rwf(todayTotal)} icon={Wallet} hint="Updates when you complete a sale" />
                  <Stat label="Transactions" value={num(sales.length)} icon={ReceiptIcon} />
                  <Stat label="Items sold" value={num(itemsSold)} icon={TrendingUp} />
                  <Stat label="Low stock" value={num(lowStock.length)} icon={TriangleAlert} hint={`At or below ${lowLimit} units`} />
                </div>
                <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                  <Panel title="Sales this week (sample)">
                    <BarChart data={[...WEEK, { label: "Today", value: todayTotal }]} format={(n) => `${Math.round(n / 1000)}k`} />
                  </Panel>
                  <Panel title="Low stock alerts">
                    {lowStock.length === 0 ? (
                      <p className="text-sm text-ink-500">All products are above the alert level.</p>
                    ) : (
                      <ul className="space-y-2">
                        {lowStock.map((p) => (
                          <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                            <span className="text-ink-700">{p.name}</span>
                            <Badge tone={p.stock === 0 ? "red" : "amber"}>{p.stock} left</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Panel>
                </div>
                <Panel title="Recent sales">{salesTable([...sales].reverse().slice(0, 4))}</Panel>
              </div>
            ),
          },
          {
            id: "sell",
            label: "New sale",
            icon: ShoppingCart,
            render: () => (
              <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                <div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                      <input className={`${inputCls} pl-9`} placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" />
                    </div>
                  </div>
                  <div className="scrollbar-none mt-2 flex gap-1.5 overflow-x-auto">
                    {categories.map((c) => (
                      <button key={c} type="button" onClick={() => setCategory(c)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${category === c ? "border-cyan-600 bg-cyan-600 text-white" : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                  <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {visible.map((p) => {
                      const inCart = cart[p.id] ?? 0;
                      const out = p.stock - inCart <= 0;
                      return (
                        <li key={p.id}>
                          <button type="button" disabled={out} onClick={() => setQty(p.id, inCart + 1)} className="flex h-full w-full flex-col rounded-xl border border-ink-200 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-card disabled:cursor-not-allowed disabled:opacity-50">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{p.category}</span>
                            <span className="mt-1 text-sm font-semibold leading-snug text-ink-900">{p.name}</span>
                            <span className="mt-auto pt-2 text-sm font-bold text-cyan-700">{rwf(p.price)}</span>
                            <span className="text-[11px] text-ink-500">{out ? "Out of stock" : `${p.stock - inCart} in stock`}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {visible.length === 0 && <p className="mt-6 text-center text-sm text-ink-500">No products match your search.</p>}
                </div>
                <Panel title={`Cart (${cartLines.reduce((a, l) => a + l.qty, 0)})`} className="lg:sticky lg:top-4 lg:self-start">
                  {cartLines.length === 0 ? (
                    <p className="py-6 text-center text-sm text-ink-500">Tap a product to add it to the cart.</p>
                  ) : (
                    <ul className="space-y-3">
                      {cartLines.map((l) => (
                        <li key={l.product.id} className="text-sm">
                          <div className="flex justify-between gap-2">
                            <span className="font-semibold text-ink-900">{l.product.name}</span>
                            <span className="tabular-nums text-ink-900">{num(l.qty * l.product.price)}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <button type="button" onClick={() => setQty(l.product.id, l.qty - 1)} className="grid h-7 w-7 place-items-center rounded-md border border-ink-200 hover:bg-ink-50" aria-label={`Decrease ${l.product.name}`}>
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-7 text-center font-semibold tabular-nums">{l.qty}</span>
                            <button type="button" onClick={() => setQty(l.product.id, l.qty + 1)} disabled={l.qty >= l.product.stock} className="grid h-7 w-7 place-items-center rounded-md border border-ink-200 hover:bg-ink-50 disabled:opacity-40" aria-label={`Increase ${l.product.name}`}>
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-xs text-ink-500">x {num(l.product.price)}</span>
                            <button type="button" onClick={() => setQty(l.product.id, 0)} className="ml-auto grid h-7 w-7 place-items-center rounded-md text-red-600 hover:bg-red-50" aria-label={`Remove ${l.product.name}`}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-4 border-t border-ink-200 pt-3">
                    <p className="flex justify-between font-display text-lg font-bold text-ink-900">
                      <span>Total</span>
                      <span className="tabular-nums">{rwf(cartTotal)}</span>
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {["Cash", "Mobile Money"].map((m) => (
                        <button key={m} type="button" onClick={() => setPayment(m)} aria-pressed={payment === m} className={`rounded-lg border px-2 py-2 text-xs font-semibold ${payment === m ? "border-cyan-600 bg-cyan-50 text-cyan-800" : "border-ink-200 text-ink-700 hover:bg-ink-50"}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                    <Btn className="mt-3 w-full" onClick={completeSale} disabled={cartLines.length === 0}>
                      Complete simulated sale
                    </Btn>
                    <p className="mt-2 text-center text-[11px] text-ink-500">No payment is taken. This is a demonstration.</p>
                  </div>
                </Panel>
              </div>
            ),
          },
          {
            id: "products",
            label: "Products & stock",
            icon: Boxes,
            render: () => (
              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <Panel title={`Products (${products.length})`}>
                  <DataTable
                    rows={products}
                    rowKey={(p) => p.id}
                    columns={[
                      { header: "Product", cell: (p) => <span className="font-semibold text-ink-900">{p.name}</span> },
                      { header: "Category", cell: (p) => p.category },
                      { header: "Price", cell: (p) => rwf(p.price), align: "right" },
                      { header: "Stock", cell: (p) => p.stock, align: "right" },
                      { header: "Status", cell: (p) => (p.stock === 0 ? <Badge tone="red">Out of stock</Badge> : p.stock <= lowLimit ? <Badge tone="amber">Low</Badge> : <Badge tone="green">In stock</Badge>) },
                      {
                        header: "",
                        cell: (p) => (
                          <Btn variant="outline" onClick={() => setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, stock: x.stock + 10 } : x)))} title="Receive 10 units">
                            +10
                          </Btn>
                        ),
                        align: "right",
                      },
                    ]}
                  />
                </Panel>
                <Panel title="Add a product">
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const price = Number(draft.price);
                      const stock = Number(draft.stock);
                      if (!draft.name.trim() || !(price > 0) || !(stock >= 0)) return;
                      setProducts((list) => [...list, { id: `n${list.length + 1}`, name: draft.name.trim().slice(0, 40), category: draft.category, price, stock: Math.floor(stock) }]);
                      setDraft({ name: "", category: draft.category, price: "", stock: "" });
                    }}
                  >
                    <FieldRow label="Name" htmlFor="pos-name">
                      <input id="pos-name" className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required maxLength={40} />
                    </FieldRow>
                    <FieldRow label="Category" htmlFor="pos-cat">
                      <select id="pos-cat" className={inputCls} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                        {categories.slice(1).map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </FieldRow>
                    <div className="grid grid-cols-2 gap-2">
                      <FieldRow label="Price (RWF)" htmlFor="pos-price">
                        <input id="pos-price" className={inputCls} type="number" min={1} value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} required />
                      </FieldRow>
                      <FieldRow label="Stock" htmlFor="pos-stock">
                        <input id="pos-stock" className={inputCls} type="number" min={0} value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} required />
                      </FieldRow>
                    </div>
                    <Btn type="submit" className="w-full">
                      <Plus className="h-4 w-4" /> Add product
                    </Btn>
                  </form>
                </Panel>
              </div>
            ),
          },
          { id: "sales", label: "Sales", icon: ReceiptIcon, render: () => <Panel title={`Sales today (${sales.length})`}>{salesTable([...sales].reverse())}</Panel> },
          {
            id: "reports",
            label: "Reports",
            icon: BarChart3,
            render: () => (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  <Stat label="Revenue today" value={rwf(todayTotal)} />
                  <Stat label="Average sale" value={rwf(sales.length ? todayTotal / sales.length : 0)} />
                  <Stat label="Stock value" value={rwf(products.reduce((s, p) => s + p.price * p.stock, 0))} hint="At selling price" />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Panel title="Revenue by category">
                    <ShareBars data={byCategory} format={rwf} />
                  </Panel>
                  <Panel title="Top products (units sold)">
                    <ShareBars data={topProducts} />
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
                  { key: "business", label: "Business name (printed on receipts)" },
                  { key: "footer", label: "Receipt footer message" },
                  { key: "lowStock", label: "Low-stock alert level", type: "number" },
                ]}
                toggles={[
                  { key: "printReceipt", label: "Print receipt after each sale", hint: "On a real installation this drives a thermal printer." },
                  { key: "offline", label: "Offline mode", hint: "Keep selling without internet and sync later." },
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
