import type { Metadata } from "next";
import Link from "next/link";

import { requireSession } from "@/lib/auth/get-current-org";
import { createClient } from "@/lib/supabase/server";
import { toggleProductActive } from "@/lib/actions/products";
import { formatEur } from "@/lib/utils";
import { Card, Badge, Dot } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { CopyLink } from "./_components/copy-link";

export const metadata: Metadata = { title: "Produkte — Kalaie Ledger" };

export default async function ProductsPage() {
  await requireSession();
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, price_amount, payment_type, down_payment, installment_count, active")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-3xl tracking-tight text-foreground">Produkte</h1>
          <p className="text-sm text-muted-foreground">Lege an, was du verkaufst — der Checkout-Link entsteht automatisch.</p>
        </div>
        <Link href="/products/new" className={buttonClass("primary")}>
          Neues Produkt
        </Link>
      </header>

      {!products?.length ? (
        <Card className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-surface-2">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="size-6 stroke-muted-foreground" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.5 7 12 3l8.5 4-8.5 4-8.5-4ZM3.5 7v10l8.5 4 8.5-4V7M12 11v10" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="font-display text-lg text-foreground">Noch keine Produkte</p>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Dein erstes Produkt ist in einer Minute angelegt.
            </p>
          </div>
          <Link href="/products/new" className={buttonClass("primary")}>
            Produkt anlegen
          </Link>
        </Card>
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {products.map((product) => (
            <div key={product.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:px-5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <Link href={`/products/${product.id}`} className="truncate font-medium text-foreground hover:text-primary">
                    {product.name}
                  </Link>
                  {product.active ? (
                    <Badge tone="success">
                      <Dot tone="success" /> Aktiv
                    </Badge>
                  ) : (
                    <Badge tone="muted">
                      <Dot tone="muted" /> Inaktiv
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium tabular-nums text-foreground">{formatEur(product.price_amount)}</span>
                  {product.payment_type === "installments" ? (
                    <>
                      {" · "}Anzahlung {formatEur(product.down_payment ?? 0)} + {product.installment_count} Raten
                    </>
                  ) : (
                    " · Einmalzahlung"
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {product.active && <CopyLink path={`/buy/${product.id}`} />}
                <Link
                  href={`/products/${product.id}`}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  Bearbeiten
                </Link>
                <form action={toggleProductActive.bind(null, product.id, !product.active)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                  >
                    {product.active ? "Deaktivieren" : "Aktivieren"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
