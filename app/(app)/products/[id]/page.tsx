import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireSession } from "@/lib/auth/get-current-org";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { CopyLink } from "../_components/copy-link";
import { ProductForm } from "../_components/product-form";

export const metadata: Metadata = { title: "Produkt bearbeiten — Kalaie Ledger" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, name, description, price_amount, payment_type, down_payment, installment_count, installment_interval_days, active")
    .eq("id", id)
    .maybeSingle();

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" className="size-4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Produkte
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl tracking-tight text-foreground">Produkt bearbeiten</h1>
        {product.active && <CopyLink path={`/buy/${product.id}`} />}
      </div>

      <Card className="p-6 sm:p-8">
        <ProductForm product={product} />
      </Card>
    </div>
  );
}
