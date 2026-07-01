import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { formatEur } from "@/lib/utils";
import { Wordmark } from "@/components/brand";
import { PublicFooter } from "@/components/public-footer";
import { SellerLegalInfo } from "@/components/seller-legal-info";
import { isSellReady } from "@/lib/legal/sell-readiness";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: org } = await admin.from("organizations").select("name").eq("slug", slug).maybeSingle();
  return { title: org ? `${org.name} — Angebote` : "Angebote" };
}

export default async function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: org } = await admin
    .from("organizations")
    .select(
      "id, name, stripe_account_id, legal_name, address_street, address_zip, address_city, address_country, contact_email, vat_id, avv_accepted_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!org) notFound();

  const { data: products } = await admin
    .from("products")
    .select("id, name, description, price_amount, payment_type, down_payment, installment_count")
    .eq("organization_id", org.id)
    .eq("active", true)
    .order("created_at", { ascending: false });

  const canSell = isSellReady(org);

  return (
    <div className="ledger-rules relative min-h-dvh">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-70"
        style={{ background: "radial-gradient(60% 100% at 50% 0, var(--primary-soft), transparent 75%)" }}
      />

      <div className="relative mx-auto max-w-2xl px-5 py-10">
        <div className="flex justify-center">
          <Wordmark />
        </div>

        <header className="mt-12 space-y-2 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-faint">Angebote von</p>
          <h1 className="font-display text-4xl tracking-tight text-foreground">{org.name}</h1>
        </header>

        <div className="mt-10 space-y-4">
          {!products?.length || !canSell ? (
            <div className="animate-rise rounded-2xl border border-border bg-surface px-6 py-16 text-center text-sm text-muted-foreground shadow-[var(--shadow-card)]">
              Aktuell sind keine Angebote verfügbar.
            </div>
          ) : (
            products.map((product, i) => {
              const isInstallment = product.payment_type === "installments";
              return (
                <Link
                  key={product.id}
                  href={`/buy/${product.id}`}
                  className="group block animate-rise rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-lift)]"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1.5">
                      <h2 className="font-display text-xl tracking-tight text-foreground">{product.name}</h2>
                      {product.description && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-display text-xl tracking-tight tabular-nums text-foreground">
                        {formatEur(Number(product.price_amount))}
                      </p>
                      {isInstallment && (
                        <p className="mt-0.5 text-xs text-faint">
                          ab {formatEur(Number(product.down_payment ?? 0))} Anzahlung
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs text-faint">
                      {isInstallment ? `Anzahlung + ${product.installment_count} Raten` : "Einmalzahlung"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      Ansehen
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <p className="mt-12 flex items-center justify-center gap-2 text-xs text-faint">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" className="size-3.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          Sichere Zahlung über Stripe
        </p>

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
      </div>

      <PublicFooter />
    </div>
  );
}
