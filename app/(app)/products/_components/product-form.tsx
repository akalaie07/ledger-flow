"use client";

import { useActionState, useState } from "react";

import { createProduct, updateProduct, type ProductFormState } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price_amount: number;
  payment_type: "one_time" | "installments";
  down_payment: number | null;
  installment_count: number | null;
  installment_interval_days: number | null;
};

export function ProductForm({ product }: { product?: Product }) {
  const action = product ? updateProduct.bind(null, product.id) : createProduct;
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, null);
  const [paymentType, setPaymentType] = useState(product?.payment_type ?? "one_time");

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div role="alert" className="rounded-lg border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </div>
      )}

      <div className="space-y-5">
        <Field label="Name" htmlFor="name" error={state?.fieldErrors?.name?.[0]}>
          <Input id="name" name="name" required defaultValue={product?.name} placeholder="z. B. Maestro Sales Masterclass" />
        </Field>

        <Field label="Beschreibung" htmlFor="description" hint="optional">
          <Textarea id="description" name="description" defaultValue={product?.description ?? ""} placeholder="Kurze Beschreibung, die der Kunde im Checkout sieht." />
        </Field>

        <Field label="Gesamtpreis" htmlFor="price_amount" hint="in Euro" error={state?.fieldErrors?.price_amount?.[0]}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
            <Input id="price_amount" name="price_amount" type="number" step="0.01" min="0" required defaultValue={product?.price_amount} className="pl-8 tabular-nums" placeholder="497.00" />
          </div>
        </Field>
      </div>

      {/* Payment type segmented control */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">Zahlungsart</span>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface-2 p-1">
          {(
            [
              ["one_time", "Einmalzahlung", "Voller Betrag sofort"],
              ["installments", "Anzahlung + Raten", "Erst-Betrag, dann Raten"],
            ] as const
          ).map(([value, title, sub]) => (
            <label
              key={value}
              className={cn(
                "cursor-pointer rounded-lg px-4 py-3 text-center transition-colors",
                paymentType === value ? "bg-surface shadow-[var(--shadow-card)]" : "hover:bg-surface/60",
              )}
            >
              <input
                type="radio"
                name="payment_type"
                value={value}
                checked={paymentType === value}
                onChange={() => setPaymentType(value)}
                className="sr-only"
              />
              <span className={cn("block text-sm font-medium", paymentType === value ? "text-primary" : "text-foreground")}>{title}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{sub}</span>
            </label>
          ))}
        </div>
      </div>

      {paymentType === "installments" && (
        <div className="animate-rise space-y-5 rounded-xl border border-border bg-surface-2/60 p-5">
          <Field label="Anzahlung" htmlFor="down_payment" hint="sofort fällig" error={state?.fieldErrors?.down_payment?.[0]}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
              <Input id="down_payment" name="down_payment" type="number" step="0.01" min="0" defaultValue={product?.down_payment ?? ""} className="pl-8 tabular-nums" placeholder="197.00" />
            </div>
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Anzahl Raten" htmlFor="installment_count" hint="nach Anzahlung">
              <Input id="installment_count" name="installment_count" type="number" min="1" defaultValue={product?.installment_count ?? ""} className="tabular-nums" placeholder="6" />
            </Field>
            <Field label="Abstand" htmlFor="installment_interval_days" hint="Tage, 30 = monatl.">
              <Select id="installment_interval_days" name="installment_interval_days" defaultValue={product?.installment_interval_days ?? 30}>
                <option value={7}>Wöchentlich (7 Tage)</option>
                <option value={14}>Alle 2 Wochen (14 Tage)</option>
                <option value={30}>Monatlich (30 Tage)</option>
              </Select>
            </Field>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Speichern…" : product ? "Änderungen speichern" : "Produkt anlegen"}
        </Button>
      </div>
    </form>
  );
}
