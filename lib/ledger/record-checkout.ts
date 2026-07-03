import "server-only";

import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/types/database";

type Admin = SupabaseClient<Database>;

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Verbucht eine abgeschlossene Checkout-Session ins Hauptbuch.
 * Idempotent: existiert bereits ein Deal mit dieser Session-ID, passiert nichts.
 *
 * - one_time     → ein Deal + eine bereits bezahlte Rate (sequence 1)
 * - installments → ein Deal + bezahlte Anzahlung (sequence 1) + N offene
 *                  Raten (sequence 2..N+1) mit Fälligkeiten im gewählten Abstand
 */
/**
 * Markiert den zugehörigen Deal als erstattet, wenn eine Zahlung (Anzahlung
 * oder Rate) auf dem verbundenen Konto zurückerstattet wird. Der Deal wird
 * anhand der PaymentIntent-ID der Rate gefunden. Sobald `refunded` gesetzt ist,
 * überspringt der Raten-Job alle weiteren offenen Raten dieses Deals.
 *
 * Bewusst konservativ: jede Erstattung stoppt künftige Abbuchungen (Schutz vor
 * Abbuchung trotz Widerruf). Läuft eine Ratenzahlung danach doch weiter, kann
 * die Organisation den Deal manuell wieder aktivieren.
 */
export async function recordRefund(admin: Admin, charge: Stripe.Charge): Promise<void> {
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
  if (!paymentIntentId) return;

  const { data: installment } = await admin
    .from("installments")
    .select("deal_id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();
  if (!installment) return;

  await admin.from("deals").update({ refunded: true }).eq("id", installment.deal_id);
}

export async function recordCheckout(admin: Admin, session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== "paid") return;

  const productId = session.metadata?.product_id;
  const organizationId = session.metadata?.organization_id;
  if (!productId || !organizationId) {
    throw new Error("Session ohne product_id/organization_id in metadata");
  }

  // Schon verbucht? (idempotent gegen Webhook-Wiederholung)
  const { data: existing } = await admin
    .from("deals")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (existing) return;

  const { data: product } = await admin
    .from("products")
    .select("id, name, price_amount, payment_type, down_payment, installment_count, installment_interval_days")
    .eq("id", productId)
    .single();
  if (!product) throw new Error(`Produkt ${productId} nicht gefunden`);

  const email = session.customer_details?.email?.toLowerCase() ?? null;
  const name = session.customer_details?.name ?? email ?? "Unbekannt";
  const stripeCustomerId = typeof session.customer === "string" ? session.customer : null;
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : null;

  if (!email) throw new Error("Session ohne Kunden-E-Mail");

  // Kunde finden oder anlegen (eindeutig je Organisation + E-Mail)
  let customerId: string;
  const { data: foundCustomer } = await admin
    .from("customers")
    .select("id, stripe_customer_id")
    .eq("organization_id", organizationId)
    .eq("email", email)
    .maybeSingle();

  if (foundCustomer) {
    customerId = foundCustomer.id;
    if (!foundCustomer.stripe_customer_id && stripeCustomerId) {
      await admin.from("customers").update({ stripe_customer_id: stripeCustomerId }).eq("id", customerId);
    }
  } else {
    const { data: newCustomer, error } = await admin
      .from("customers")
      .insert({ organization_id: organizationId, email, name, stripe_customer_id: stripeCustomerId })
      .select("id")
      .single();
    if (error || !newCustomer) throw new Error(`Kunde anlegen fehlgeschlagen: ${error?.message}`);
    customerId = newCustomer.id;
  }

  const isInstallment = product.payment_type === "installments";
  const total = Number(product.price_amount);
  const downPayment = isInstallment ? Number(product.down_payment ?? 0) : total;

  // Deal anlegen (Preis-Snapshot zum Kaufzeitpunkt)
  const { data: deal, error: dealError } = await admin
    .from("deals")
    .insert({
      organization_id: organizationId,
      customer_id: customerId,
      product_id: product.id,
      total_price: total,
      payment_type: product.payment_type,
      down_payment: isInstallment ? downPayment : null,
      stripe_checkout_session_id: session.id,
    })
    .select("id")
    .single();
  if (dealError || !deal) throw new Error(`Deal anlegen fehlgeschlagen: ${dealError?.message}`);

  const now = new Date();
  const nowIso = now.toISOString();

  type InstallmentInsert = Database["public"]["Tables"]["installments"]["Insert"];
  const rows: InstallmentInsert[] = [];

  // sequence 1 = jetzt bezahlter Betrag (Anzahlung bzw. voller Einmalbetrag)
  rows.push({
    organization_id: organizationId,
    deal_id: deal.id,
    sequence: 1,
    due_date: nowIso.slice(0, 10),
    amount: downPayment,
    paid: true,
    paid_at: nowIso,
    stripe_payment_intent_id: paymentIntentId,
  });

  if (isInstallment) {
    const count = product.installment_count ?? 0;
    const interval = product.installment_interval_days ?? 30;
    const remainderCents = Math.round((total - downPayment) * 100);
    const baseCents = Math.floor(remainderCents / count);
    for (let i = 1; i <= count; i++) {
      // Rundungsdifferenz in die letzte Rate legen, damit die Summe exakt stimmt
      const cents = i === count ? remainderCents - baseCents * (count - 1) : baseCents;
      rows.push({
        organization_id: organizationId,
        deal_id: deal.id,
        sequence: i + 1,
        due_date: addDays(now, interval * i),
        amount: cents / 100,
        paid: false,
      });
    }
  }

  const { error: instError } = await admin.from("installments").insert(rows);
  if (instError) throw new Error(`Raten anlegen fehlgeschlagen: ${instError.message}`);
}
