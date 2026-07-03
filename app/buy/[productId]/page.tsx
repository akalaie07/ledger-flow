import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { startCheckout } from "@/lib/actions/checkout";
import { formatEur } from "@/lib/utils";
import { Wordmark } from "@/components/brand";
import { PublicFooter } from "@/components/public-footer";
import { SellerLegalInfo } from "@/components/seller-legal-info";
import { isSellReady } from "@/lib/legal/sell-readiness";
import { CheckoutButton } from "./_components/checkout-button";

export const metadata: Metadata = { title: "Checkout — Kalaie Ledger" };

export default async function BuyPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { productId } = await params;
  const { error } = await searchParams;

  const admin = createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select(
      "id, name, description, price_amount, payment_type, down_payment, installment_count, installment_interval_days, active, organizations(name, stripe_account_id, legal_name, address_street, address_zip, address_city, address_country, contact_email, vat_id, avv_accepted_at)",
    )
    .eq("id", productId)
    .maybeSingle();

  if (!product) notFound();

  const org = Array.isArray(product.organizations) ? product.organizations[0] : product.organizations;
  const available = product.active && !!org && isSellReady(org);

  const isInstallment = product.payment_type === "installments";
  const downPayment = Number(product.down_payment ?? 0);
  const rateCount = product.installment_count ?? 0;
  const ratePer = isInstallment && rateCount > 0 ? (Number(product.price_amount) - downPayment) / rateCount : 0;
  const chargeNow = isInstallment ? downPayment : Number(product.price_amount);
  const intervalLabel =
    product.installment_interval_days === 7 ? "wöchentlich" : product.installment_interval_days === 14 ? "alle 2 Wochen" : "monatlich";

  return (
    <div className="ledger-rules relative min-h-dvh">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-70"
        style={{ background: "radial-gradient(60% 100% at 50% 0, var(--primary-soft), transparent 75%)" }}
      />

      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col px-5 py-8">
        <div className="flex justify-center">
          <Wordmark />
        </div>

        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="animate-rise overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-lift)]">
            {/* Seller */}
            <div className="border-b border-border px-6 py-3.5">
              <p className="text-xs text-faint">
                Angeboten von <span className="font-medium text-muted-foreground">{org?.name ?? "—"}</span>
              </p>
            </div>

            <div className="space-y-6 p-6">
              <div className="space-y-1.5">
                <h1 className="font-display text-2xl tracking-tight text-foreground">{product.name}</h1>
                {product.description && <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>}
              </div>

              {/* Price breakdown */}
              <div className="rounded-xl border border-border bg-surface-2/60 p-4">
                {isInstallment ? (
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-baseline justify-between">
                      <span className="text-muted-foreground">Heute fällig</span>
                      <span className="font-display text-xl tracking-tight tabular-nums text-foreground">{formatEur(chargeNow)}</span>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-border pt-2.5 text-muted-foreground">
                      <span>danach {rateCount} × {intervalLabel}</span>
                      <span className="tabular-nums">{formatEur(ratePer)}</span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs text-faint">
                      <span>Gesamtpreis</span>
                      <span className="tabular-nums">{formatEur(Number(product.price_amount))}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">Preis</span>
                    <span className="font-display text-2xl tracking-tight tabular-nums text-foreground">{formatEur(chargeNow)}</span>
                  </div>
                )}
              </div>

              {error === "cancelled" && (
                <p className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-muted-foreground">
                  Der Bezahlvorgang wurde abgebrochen. Du kannst es jederzeit erneut versuchen.
                </p>
              )}
              {error === "unavailable" && (
                <p className="rounded-lg border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
                  Dieses Produkt ist aktuell nicht verfügbar.
                </p>
              )}

              {available ? (
                <div className="space-y-3">
                  {error === "consent" && (
                    <p role="alert" className="rounded-lg border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
                      Bitte bestätige den sofortigen Leistungsbeginn, um fortzufahren.
                    </p>
                  )}
                  <form action={startCheckout.bind(null, product.id)} className="space-y-3">
                    <label htmlFor="withdrawal_consent" className="flex items-start gap-2.5 text-left text-xs leading-relaxed text-muted-foreground">
                      <input
                        id="withdrawal_consent"
                        name="withdrawal_consent"
                        type="checkbox"
                        required
                        className="mt-0.5 size-4 shrink-0 rounded border-border-strong accent-primary"
                      />
                      <span>
                        Ich verlange ausdrücklich, dass mit der Leistung sofort begonnen wird, und mir ist bekannt, dass
                        mein Widerrufsrecht mit vollständiger Vertragserfüllung erlischt.
                      </span>
                    </label>
                    <CheckoutButton label={isInstallment ? "Zahlungspflichtig bestellen" : "Zahlungspflichtig kaufen"} />
                  </form>
                  <p className="text-center text-xs leading-relaxed text-faint">
                    Preis inkl. ggf. gesetzlicher USt. Der Kaufvertrag kommt mit {org?.name ?? "der Organisation"} zustande,
                    nicht mit Kalaie Ledger. Es gilt die allgemeine{" "}
                    <a href="/widerruf" target="_blank" className="underline underline-offset-2 hover:text-muted-foreground">Widerrufsbelehrung</a>.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-center text-sm text-danger">
                  Dieses Produkt ist aktuell nicht verfügbar.
                </div>
              )}
            </div>

            {/* Trust footer */}
            <div className="flex items-center justify-center gap-2 border-t border-border bg-surface-2/40 px-6 py-3.5 text-xs text-faint">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" className="size-3.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              Sichere Zahlung über Stripe
            </div>
          </div>
        </div>

        {org && (
          <SellerLegalInfo
            name={org.name}
            legal_name={org.legal_name}
            address_street={org.address_street}
            address_zip={org.address_zip}
            address_city={org.address_city}
            address_country={org.address_country}
            contact_email={org.contact_email}
            vat_id={org.vat_id}
          />
        )}

        <PublicFooter />
      </div>
    </div>
  );
}
