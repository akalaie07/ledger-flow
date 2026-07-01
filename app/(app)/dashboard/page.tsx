import type { Metadata } from "next";
import Link from "next/link";

import { requireSession } from "@/lib/auth/get-current-org";
import { createClient } from "@/lib/supabase/server";
import { formatEur, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { StatusBadge, type DealStatus } from "../deals/_components/status-badge";
import { RevenueChart } from "./_components/revenue-chart";

export const metadata: Metadata = { title: "Übersicht — Kalaie Ledger" };

const dayMonth = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short" });

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const session = await requireSession();
  const { range: rangeParam } = await searchParams;
  const range = rangeParam === "90" ? 90 : 30;
  const supabase = await createClient();

  const [{ data: org }, { data: deals }, { data: productRows }, { data: nameRows }, { data: installments }] =
    await Promise.all([
      supabase.from("organizations").select("stripe_account_id").eq("id", session.organizationId).single(),
      supabase
        .from("deals_with_status")
        .select("id, total_price, paid_sum, open_sum, overdue_sum, computed_status, created_at, payment_type, product_id, customer_id")
        .order("created_at", { ascending: false }),
      supabase.from("products").select("id, name"),
      supabase.from("deals").select("id, customers(name), products(name)"),
      supabase.from("installments").select("amount, paid, paid_at, due_date, failed_attempts, deal_id"),
    ]);

  const productCount = productRows?.length ?? 0;
  const productNameMap = new Map((productRows ?? []).map((p) => [p.id, p.name]));

  const names = new Map(
    (nameRows ?? []).map((r) => {
      const customer = Array.isArray(r.customers) ? r.customers[0] : r.customers;
      const product = Array.isArray(r.products) ? r.products[0] : r.products;
      return [r.id, { customer: customer?.name ?? "—", product: product?.name ?? "—" }];
    }),
  );
  const dealById = new Map((deals ?? []).map((d) => [d.id, d]));

  const stripeConnected = !!org?.stripe_account_id;
  const dealCount = deals?.length ?? 0;
  const inst = installments ?? [];

  // KPIs
  const paidTotal = inst.reduce((s, i) => s + (i.paid ? Number(i.amount) : 0), 0);
  const open = (deals ?? []).reduce((s, d) => s + Number(d.open_sum ?? 0), 0);
  const overdue = (deals ?? []).reduce((s, d) => s + Number(d.overdue_sum ?? 0), 0);
  const gesamt = (deals ?? []).reduce((s, d) => s + Number(d.total_price ?? 0), 0);

  // Trend (bezahlter Umsatz: aktueller Zeitraum vs. vorheriger)
  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setDate(now.getDate() - range);
  const prevStart = new Date(now);
  prevStart.setDate(now.getDate() - 2 * range);
  const paidInWindow = (from: Date, to: Date) =>
    inst.reduce((s, i) => {
      if (!i.paid || !i.paid_at) return s;
      const t = new Date(i.paid_at);
      return t >= from && t < to ? s + Number(i.amount) : s;
    }, 0);
  const paidThis = paidInWindow(rangeStart, new Date(now.getTime() + 86400000));
  const paidPrev = paidInWindow(prevStart, rangeStart);
  const trendPct = paidPrev > 0 ? Math.round(((paidThis - paidPrev) / paidPrev) * 100) : paidThis > 0 ? 100 : 0;

  // Chart: bezahlter Umsatz pro Tag im Zeitraum
  const perDay = new Map<string, number>();
  for (let d = new Date(rangeStart); d <= now; d.setDate(d.getDate() + 1)) {
    perDay.set(isoDay(d), 0);
  }
  for (const i of inst) {
    if (!i.paid || !i.paid_at) continue;
    const key = i.paid_at.slice(0, 10);
    if (perDay.has(key)) perDay.set(key, (perDay.get(key) ?? 0) + Number(i.amount));
  }
  const chartData = [...perDay.entries()].map(([day, value]) => ({
    label: dayMonth.format(new Date(day)),
    value,
  }));

  // Top-Produkte nach Umsatz
  const byProduct = new Map<string, number>();
  for (const d of deals ?? []) {
    if (!d.product_id) continue;
    byProduct.set(d.product_id, (byProduct.get(d.product_id) ?? 0) + Number(d.total_price));
  }
  const topProducts = [...byProduct.entries()]
    .map(([pid, sum]) => ({ name: productNameMap.get(pid) ?? "Unbekannt", sum }))
    .sort((a, b) => b.sum - a.sum)
    .slice(0, 5);
  const topMax = Math.max(1, ...topProducts.map((p) => p.sum));

  // Nächste fällige Raten
  const today = isoDay(now);
  const upcoming = inst
    .filter((i) => !i.paid && i.due_date >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5);

  // Fehlgeschlagene Abbuchungen
  const failed = inst.filter((i) => !i.paid && (i.failed_attempts ?? 0) > 0);
  const failedSum = failed.reduce((s, i) => s + Number(i.amount), 0);

  const recentDeals = (deals ?? []).slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Hallo {session.fullName?.split(" ")[0] ?? session.email}</p>
          <h1 className="font-display text-3xl tracking-tight text-foreground">Übersicht</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-surface p-0.5 text-sm">
            {[30, 90].map((r) => (
              <Link
                key={r}
                href={`/dashboard?range=${r}`}
                className={cn(
                  "rounded-md px-3 py-1.5 font-medium transition-colors",
                  range === r ? "bg-surface-2 text-foreground shadow-[var(--shadow-card)]" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r} Tage
              </Link>
            ))}
          </div>
          <Link href="/products/new" className={buttonClass("primary")}>
            Produkt anlegen
          </Link>
        </div>
      </header>

      {!stripeConnected ? (
        <Card className="overflow-hidden">
          <div className="bg-grid border-b border-border p-7">
            <h2 className="font-display text-xl tracking-tight text-foreground">Richte deinen Verkauf ein</h2>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">Noch zwei Schritte, dann fließen Käufe automatisch in dein Hauptbuch.</p>
          </div>
          <ol className="divide-y divide-border">
            <SetupRow n={1} done={stripeConnected} title="Stripe verbinden" desc="Verknüpfe das Stripe-Konto, über das Zahlungen laufen." href="/settings" cta="Verbinden" />
            <SetupRow n={2} done={(productCount ?? 0) > 0} title="Erstes Produkt anlegen" desc="Lege fest, was du verkaufst und zu welchem Preis." href="/products/new" cta="Anlegen" />
          </ol>
        </Card>
      ) : dealCount === 0 ? (
        <Card className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-surface-2">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="size-6 stroke-muted-foreground" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18M7 14l3-3 3 3 5-6" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="font-display text-lg text-foreground">Noch keine Deals</p>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">Sobald ein Kunde über deinen Checkout-Link kauft, erscheint der Deal automatisch hier.</p>
          </div>
          <Link href="/products" className={buttonClass("secondary")}>Zu den Produkten</Link>
        </Card>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Bezahlter Umsatz" value={formatEur(paidTotal)} trend={trendPct} trendNote={`vs. vorherige ${range} T.`} />
            <Kpi label="Offene Forderungen" value={formatEur(open)} />
            <Kpi label="Überfällig" value={formatEur(overdue)} tone={overdue > 0 ? "danger" : "default"} />
            <Kpi label="Umsatz gesamt" value={formatEur(gesamt)} sub={`${dealCount} Deals`} />
          </div>

          {/* Failed payments alert */}
          {failed.length > 0 && (
            <Link href="/deals" className="flex items-center gap-3 rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger transition-colors hover:bg-danger-soft/70">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="size-5 shrink-0" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
              <span>
                <strong>{failed.length} fehlgeschlagene Abbuchung{failed.length > 1 ? "en" : ""}</strong> ({formatEur(failedSum)}) — Karte abgelehnt oder Bestätigung nötig.
              </span>
            </Link>
          )}

          {/* Revenue chart */}
          <Card className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Umsatzverlauf</h2>
              <span className="text-xs text-faint">Letzte {range} Tage · bezahlt</span>
            </div>
            <RevenueChart data={chartData} />
          </Card>

          {/* Two columns */}
          <div className="grid gap-3 lg:grid-cols-2">
            {/* Top products */}
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-medium text-foreground">Top-Produkte nach Umsatz</h2>
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Daten.</p>
              ) : (
                <ul className="space-y-3">
                  {topProducts.map((p) => (
                    <li key={p.name} className="space-y-1.5">
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate text-foreground">{p.name}</span>
                        <span className="shrink-0 font-medium tabular-nums text-foreground">{formatEur(p.sum)}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(p.sum / topMax) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Upcoming installments */}
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-medium text-foreground">Nächste fällige Raten</h2>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine offenen Raten in Sicht.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {upcoming.map((i, idx) => {
                    const deal = dealById.get(i.deal_id);
                    const info = deal ? names.get(deal.id) : undefined;
                    return (
                      <li key={idx} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-foreground">{info?.customer ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">fällig {dayMonth.format(new Date(i.due_date))}</p>
                        </div>
                        <span className="shrink-0 font-medium tabular-nums text-foreground">{formatEur(Number(i.amount))}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>

          {/* Recent deals */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-medium text-foreground">Letzte Deals</h2>
              <Link href="/deals" className="text-sm text-primary hover:underline">Alle ansehen</Link>
            </div>
            <ul className="divide-y divide-border">
              {recentDeals.map((d) => {
                const info = names.get(d.id);
                return (
                  <li key={d.id}>
                    <Link href={`/deals/${d.id}`} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-2/50">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{info?.customer ?? "—"}</p>
                        <p className="truncate text-xs text-muted-foreground">{info?.product ?? "—"} · {dayMonth.format(new Date(d.created_at))}</p>
                      </div>
                      <span className="font-medium tabular-nums text-foreground">{formatEur(Number(d.total_price))}</span>
                      <StatusBadge status={d.computed_status as DealStatus} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  trend,
  trendNote,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  trend?: number;
  trendNote?: string;
  sub?: string;
  tone?: "default" | "danger";
}) {
  const up = (trend ?? 0) > 0;
  const down = (trend ?? 0) < 0;
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-faint">{label}</p>
      <p className={cn("mt-3 font-display text-2xl tracking-tight tabular-nums", tone === "danger" ? "text-danger" : "text-foreground")}>{value}</p>
      {trend !== undefined ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs">
          <span className={cn("inline-flex items-center gap-0.5 font-medium", up ? "text-success" : down ? "text-danger" : "text-faint")}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" className={cn("size-3", down && "rotate-180")} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            {Math.abs(trend)}%
          </span>
          <span className="text-faint">{trendNote}</span>
        </p>
      ) : sub ? (
        <p className="mt-1.5 text-xs text-faint">{sub}</p>
      ) : (
        <p className="mt-1.5 text-xs text-transparent">·</p>
      )}
    </Card>
  );
}

function SetupRow({ n, done, title, desc, href, cta }: { n: number; done: boolean; title: string; desc: string; href: string; cta: string }) {
  return (
    <li className="flex items-center gap-4 px-7 py-4">
      <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums", done ? "bg-success-soft text-success" : "border border-border-strong text-muted-foreground")}>
        {done ? (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" className="size-3.5 stroke-success" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 6" /></svg>
        ) : (
          n
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="truncate text-sm text-muted-foreground">{desc}</p>
      </div>
      {!done && (
        <Link href={href} className={buttonClass("secondary")}>{cta}</Link>
      )}
    </li>
  );
}
