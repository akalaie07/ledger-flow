import type { Metadata } from "next";
import Link from "next/link";

import { requireSession } from "@/lib/auth/get-current-org";
import { Card } from "@/components/ui/card";
import { ProductForm } from "../_components/product-form";

export const metadata: Metadata = { title: "Neues Produkt — Kalaie Ledger" };

export default async function NewProductPage() {
  await requireSession();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" className="size-4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Produkte
      </Link>
      <h1 className="font-display text-3xl tracking-tight text-foreground">Neues Produkt</h1>
      <Card className="p-6 sm:p-8">
        <ProductForm />
      </Card>
    </div>
  );
}
