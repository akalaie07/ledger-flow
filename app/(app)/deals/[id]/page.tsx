import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireSession } from "@/lib/auth/get-current-org";
import { createClient } from "@/lib/supabase/server";
import { formatEur, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { StatusBadge, type DealStatus } from "../_components/status-badge";

export const metadata: Metadata = { title: "Deal — Kalaie Ledger" };

const dateFmt = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "long", year: "numeric" });

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: status }, { data: deal }, { data: installments }] = await Promise.all([
    supabase.from("deals_with_status").select("computed_status, paid_sum, open_sum, overdue_sum").eq("id", id).maybeSingle(),
    supabase.from("deals").select("id, total_price, payment_type, down_payment, created_at, customers(name, email), products(name)").eq("id", id).maybeSingle(),
    supabase.from("installments").select("sequence, due_date, amount, paid, paid_at").eq("deal_id", id).order("sequence"),
  ]);

  if (!deal) notFound();

  const customer = Array.isArray(deal.customers) ? deal.customers[0] : deal.customers;
  const product = Array.isArray(deal.products) ? deal.products[0] : deal.products;
  const today = new Date().toISOString().slice(0, 10);

  const summary = [
    { label: "Gesamtpreis", value: formatEur(Number(deal.total_price)) },
    { label: "Bezahlt", value: formatEur(Number(status?.paid_sum ?? 0)) },
    { label: "Offen", value: formatEur(Number(status?.open_sum ?? 0)) },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/deals" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" className="size-4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Deals
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-display text-3xl tracking-tight text-foreground">{customer?.name ?? "—"}</h1>
          <p className="text-sm text-muted-foreground">
            {product?.name ?? "—"} · {dateFmt.format(new Date(deal.created_at))}
          </p>
        </div>
        <StatusBadge status={(status?.computed_status as DealStatus) ?? "open"} />
      </div>

      {/* Summary */}
      <Card className="grid grid-cols-3 divide-x divide-border">
        {summary.map((s) => (
          <div key={s.label} className="px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.07em] text-faint">{s.label}</p>
            <p className="mt-1.5 font-display text-xl tracking-tight tabular-nums text-foreground">{s.value}</p>
          </div>
        ))}
      </Card>

      {/* Customer */}
      <Card className="p-5">
        <h2 className="text-sm font-medium text-foreground">Kunde</h2>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-foreground">{customer?.name ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">E-Mail</dt>
            <dd className="text-foreground">{customer?.email ?? "—"}</dd>
          </div>
        </dl>
      </Card>

      {/* Payment schedule */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-medium text-foreground">Zahlungsplan</h2>
          <span className="text-xs text-faint">
            {deal.payment_type === "installments" ? "Anzahlung + Raten" : "Einmalzahlung"}
          </span>
        </div>
        <ul className="divide-y divide-border">
          {(installments ?? []).map((inst) => {
            const isOverdue = !inst.paid && inst.due_date < today;
            return (
              <li key={inst.sequence} className="flex items-center gap-4 px-5 py-3.5">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums",
                    inst.paid ? "bg-success-soft text-success" : isOverdue ? "bg-danger-soft text-danger" : "border border-border-strong text-muted-foreground",
                  )}
                >
                  {inst.paid ? (
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" className="size-3.5 stroke-success" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 5 5L20 6" />
                    </svg>
                  ) : (
                    inst.sequence
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {inst.sequence === 1 && deal.payment_type === "installments" ? "Anzahlung" : `Rate ${inst.sequence}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {inst.paid
                      ? `Bezahlt am ${dateFmt.format(new Date(inst.paid_at ?? inst.due_date))}`
                      : `Fällig am ${dateFmt.format(new Date(inst.due_date))}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium tabular-nums text-foreground">{formatEur(Number(inst.amount))}</p>
                  <p className={cn("text-xs", inst.paid ? "text-success" : isOverdue ? "text-danger" : "text-faint")}>
                    {inst.paid ? "bezahlt" : isOverdue ? "überfällig" : "offen"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
