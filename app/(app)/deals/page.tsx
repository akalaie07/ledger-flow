import type { Metadata } from "next";
import Link from "next/link";

import { requireSession } from "@/lib/auth/get-current-org";
import { createClient } from "@/lib/supabase/server";
import { formatEur } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { StatusBadge, type DealStatus } from "./_components/status-badge";

export const metadata: Metadata = { title: "Deals — Kalaie Ledger" };

const dateFmt = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short", year: "numeric" });

export default async function DealsPage() {
  await requireSession();
  const supabase = await createClient();

  const [{ data: statusRows }, { data: nameRows }] = await Promise.all([
    supabase
      .from("deals_with_status")
      .select("id, computed_status, paid_sum, open_sum, total_price, payment_type, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("deals").select("id, customers(name, email), products(name)"),
  ]);

  const names = new Map(
    (nameRows ?? []).map((r) => {
      const customer = Array.isArray(r.customers) ? r.customers[0] : r.customers;
      const product = Array.isArray(r.products) ? r.products[0] : r.products;
      return [r.id, { customer, product }];
    }),
  );

  const deals = statusRows ?? [];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-display text-3xl tracking-tight text-foreground">Deals</h1>
        <p className="text-sm text-muted-foreground">Jeder Kauf erscheint hier automatisch — inkl. Zahlungsstatus.</p>
      </header>

      {deals.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-surface-2">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="size-6 stroke-muted-foreground" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <path d="M8 8h8M8 12h8M8 16h5" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="font-display text-lg text-foreground">Noch keine Deals</p>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Sobald ein Kunde über deinen Checkout-Link kauft, landet der Deal hier.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          <div className="hidden grid-cols-[1.6fr_1fr_1fr_auto] gap-4 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.06em] text-faint sm:grid">
            <span>Kunde</span>
            <span className="text-right">Gesamt</span>
            <span className="text-right">Offen</span>
            <span className="w-24 text-right">Status</span>
          </div>
          {deals.map((d) => {
            const info = names.get(d.id);
            return (
              <Link
                key={d.id}
                href={`/deals/${d.id}`}
                className="grid grid-cols-2 items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-surface-2/50 sm:grid-cols-[1.6fr_1fr_1fr_auto]"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{info?.customer?.name ?? "—"}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {info?.product?.name ?? "—"} · {dateFmt.format(new Date(d.created_at))}
                  </p>
                </div>
                <p className="text-right font-medium tabular-nums text-foreground sm:text-right">{formatEur(Number(d.total_price))}</p>
                <p className="hidden text-right tabular-nums text-muted-foreground sm:block">
                  {Number(d.open_sum) > 0 ? formatEur(Number(d.open_sum)) : "—"}
                </p>
                <div className="flex justify-end sm:w-24">
                  <StatusBadge status={d.computed_status as DealStatus} />
                </div>
              </Link>
            );
          })}
        </Card>
      )}
    </div>
  );
}
