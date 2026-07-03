import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/types/database";
import { getStripe } from "@/lib/stripe";

type Admin = SupabaseClient<Database>;

// Nach so vielen fehlgeschlagenen Versuchen wird eine Rate nicht weiter
// automatisch abgebucht (z. B. abgelaufene Karte) — sonst würde der Job sie
// täglich für immer erneut belasten, was Stripe abstraft. Danach ist manuelle
// Klärung durch die Organisation nötig.
const MAX_FAILED_ATTEMPTS = 3;

export type ChargeResult = {
  due: number;
  charged: number;
  failed: number;
  skipped: number;
  details: Array<{ installmentId: string; status: "charged" | "failed" | "skipped"; reason?: string }>;
};

type CardSource = { customer: string; paymentMethod: string } | null;

/**
 * Bucht alle fälligen, offenen Raten off-session von der gespeicherten Karte ab.
 *
 * Läuft je Rate isoliert (eine fehlgeschlagene Karte stoppt nicht die anderen).
 * Idempotent: Stripe-Idempotency-Key = installment.id verhindert Doppel-
 * abbuchung, falls der Job mittendrin abbricht und erneut läuft.
 *
 * WICHTIG: Stripe legt pro Checkout einen NEUEN Kunden an. Die für spätere
 * Raten gespeicherte Karte hängt also am Kunden DIESES Deals — nicht zwingend
 * an customers.stripe_customer_id. Quelle der Wahrheit ist daher die Anzahlungs-
 * PaymentIntent (erste bezahlte Rate): deren customer + payment_method gehören
 * zusammen. Alle Stripe-Calls laufen auf dem verbundenen Konto der Org.
 */
export async function chargeDueInstallments(admin: Admin, today = new Date().toISOString().slice(0, 10)): Promise<ChargeResult> {
  const stripe = getStripe();
  const result: ChargeResult = { due: 0, charged: 0, failed: 0, skipped: 0, details: [] };

  const { data: due, error } = await admin
    .from("installments")
    .select("id, amount, deal_id, failed_attempts, deals(refunded, cancelled, customers(email), organizations(stripe_account_id))")
    .eq("paid", false)
    .lte("due_date", today)
    .order("due_date");

  if (error) throw new Error(`Fällige Raten laden fehlgeschlagen: ${error.message}`);
  result.due = due?.length ?? 0;

  // Karten-Quelle (customer + payment_method) je Deal nur einmal ermitteln
  const cardCache = new Map<string, CardSource>();

  async function getCardSource(dealId: string, stripeAccount: string): Promise<CardSource> {
    if (cardCache.has(dealId)) return cardCache.get(dealId)!;
    let source: CardSource = null;

    const { data: downPayment } = await admin
      .from("installments")
      .select("stripe_payment_intent_id")
      .eq("deal_id", dealId)
      .not("stripe_payment_intent_id", "is", null)
      .order("sequence")
      .limit(1)
      .maybeSingle();

    if (downPayment?.stripe_payment_intent_id) {
      const pi = await stripe.paymentIntents.retrieve(downPayment.stripe_payment_intent_id, {}, { stripeAccount });
      const customer = typeof pi.customer === "string" ? pi.customer : null;
      const paymentMethod = typeof pi.payment_method === "string" ? pi.payment_method : null;
      if (customer && paymentMethod) source = { customer, paymentMethod };
    }

    cardCache.set(dealId, source);
    return source;
  }

  for (const inst of due ?? []) {
    const deal = Array.isArray(inst.deals) ? inst.deals[0] : inst.deals;
    const org = Array.isArray(deal?.organizations) ? deal?.organizations[0] : deal?.organizations;
    const customer = Array.isArray(deal?.customers) ? deal?.customers[0] : deal?.customers;
    const stripeAccount = org?.stripe_account_id ?? undefined;

    // Stornierte oder erstattete Deals nicht weiter abbuchen — sonst würde nach
    // einem Widerruf/Refund trotzdem die nächste Rate eingezogen.
    if (deal?.refunded || deal?.cancelled) {
      result.skipped++;
      result.details.push({ installmentId: inst.id, status: "skipped", reason: "Deal storniert/erstattet" });
      continue;
    }

    // Nach zu vielen Fehlversuchen automatisches Abbuchen stoppen.
    if ((inst.failed_attempts ?? 0) >= MAX_FAILED_ATTEMPTS) {
      result.skipped++;
      result.details.push({ installmentId: inst.id, status: "skipped", reason: "Nach mehreren Fehlversuchen gestoppt" });
      continue;
    }

    if (!stripeAccount) {
      result.skipped++;
      result.details.push({ installmentId: inst.id, status: "skipped", reason: "Kein verbundenes Stripe-Konto" });
      continue;
    }

    try {
      const card = await getCardSource(inst.deal_id, stripeAccount);
      if (!card) {
        result.skipped++;
        result.details.push({ installmentId: inst.id, status: "skipped", reason: "Keine gespeicherte Karte (Anzahlungs-PI)" });
        continue;
      }

      const intent = await stripe.paymentIntents.create(
        {
          amount: Math.round(Number(inst.amount) * 100),
          currency: "eur",
          customer: card.customer,
          payment_method: card.paymentMethod,
          off_session: true,
          confirm: true,
          // Beleg-Mail an den Kunden, damit die Abbuchung nicht unangekündigt
          // erfolgt (Transparenz, weniger Rückbuchungen).
          receipt_email: customer?.email ?? undefined,
          metadata: { installment_id: inst.id, deal_id: inst.deal_id },
        },
        { stripeAccount, idempotencyKey: `installment_${inst.id}` },
      );

      if (intent.status === "succeeded") {
        await admin
          .from("installments")
          .update({ paid: true, paid_at: new Date().toISOString(), stripe_payment_intent_id: intent.id })
          .eq("id", inst.id);
        result.charged++;
        result.details.push({ installmentId: inst.id, status: "charged" });
      } else {
        await admin.from("installments").update({ failed_attempts: (inst.failed_attempts ?? 0) + 1 }).eq("id", inst.id);
        result.failed++;
        result.details.push({ installmentId: inst.id, status: "failed", reason: `Status ${intent.status}` });
      }
    } catch (err) {
      await admin.from("installments").update({ failed_attempts: (inst.failed_attempts ?? 0) + 1 }).eq("id", inst.id);
      result.failed++;
      result.details.push({ installmentId: inst.id, status: "failed", reason: (err as Error).message });
    }
  }

  return result;
}
