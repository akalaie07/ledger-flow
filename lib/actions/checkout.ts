"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { isSellReady, SELL_READINESS_COLUMNS } from "@/lib/legal/sell-readiness";

// Öffentliche Action: ein Kunde (nicht eingeloggt) startet den Kauf eines
// Produkts. Liest Produkt + verbundenes Stripe-Konto über den Service-Role-
// Client (umgeht RLS, läuft nur serverseitig) und erzeugt eine Stripe-
// Checkout-Session AUF DEM verbundenen Konto der Organisation.
//
// - one_time      → voller Betrag, einmalig
// - installments  → nur die Anzahlung jetzt; Karte wird für die späteren
//                   Raten gespeichert (setup_future_usage), Abbuchung der
//                   Raten erfolgt später per Job (Phase 4).
export async function startCheckout(productId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: product } = await admin
    .from("products")
    .select(
      `id, organization_id, name, price_amount, payment_type, down_payment, active, organizations(name, ${SELL_READINESS_COLUMNS})`,
    )
    .eq("id", productId)
    .maybeSingle();

  const org = Array.isArray(product?.organizations) ? product?.organizations[0] : product?.organizations;

  // Verkauf nur, wenn Stripe verbunden UND Pflichtangaben + AVV vollständig
  // sind. Serverseitige Sperre, damit sie nicht über die UI umgangen wird.
  if (!product || !product.active || !org || !isSellReady(org)) {
    redirect(`/buy/${productId}?error=unavailable`);
  }

  const isInstallment = product.payment_type === "installments";
  const chargeNow = isInstallment ? Number(product.down_payment ?? 0) : Number(product.price_amount);
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

  const session = await getStripe().checkout.sessions.create(
    {
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(chargeNow * 100),
            product_data: {
              name: isInstallment ? `${product.name} — Anzahlung` : product.name,
            },
          },
        },
      ],
      customer_creation: "always",
      payment_intent_data: isInstallment ? { setup_future_usage: "off_session" } : undefined,
      metadata: {
        product_id: product.id,
        organization_id: product.organization_id,
        payment_type: product.payment_type,
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/buy/${product.id}?error=cancelled`,
    },
    { stripeAccount: org.stripe_account_id },
  );

  redirect(session.url!);
}
