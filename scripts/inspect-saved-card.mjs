// Prüft, wo die gespeicherte Karte des Raten-Deals wirklich liegt:
// vergleicht customers.stripe_customer_id mit dem Customer/PM der Anzahlungs-
// PaymentIntent auf dem verbundenen Konto.
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { config } from "dotenv";
config({ path: ".env.local" });

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Jüngsten Raten-Deal mit echter (nicht test-) Session holen
const { data: deal } = await admin
  .from("deals")
  .select("id, customer_id, organization_id, stripe_checkout_session_id, customers(stripe_customer_id, email), organizations(stripe_account_id)")
  .eq("payment_type", "installments")
  .like("stripe_checkout_session_id", "cs_test_a1%")
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

if (!deal) { console.log("Kein echter Raten-Deal gefunden."); process.exit(0); }
const cust = Array.isArray(deal.customers) ? deal.customers[0] : deal.customers;
const org = Array.isArray(deal.organizations) ? deal.organizations[0] : deal.organizations;
const acct = org.stripe_account_id;

console.log("Deal:", deal.id);
console.log("customers.stripe_customer_id (gespeichert):", cust.stripe_customer_id);

const { data: dp } = await admin
  .from("installments")
  .select("stripe_payment_intent_id")
  .eq("deal_id", deal.id)
  .not("stripe_payment_intent_id", "is", null)
  .order("sequence")
  .limit(1)
  .maybeSingle();

console.log("Anzahlungs-PI:", dp?.stripe_payment_intent_id);
const pi = await stripe.paymentIntents.retrieve(dp.stripe_payment_intent_id, {}, { stripeAccount: acct });
console.log("PI.customer (Karte hängt hier):", pi.customer);
console.log("PI.payment_method:", pi.payment_method);
console.log("Stimmen überein?:", pi.customer === cust.stripe_customer_id);

// Karten auf dem gespeicherten Kunden?
const pmsStored = await stripe.paymentMethods.list({ customer: cust.stripe_customer_id, type: "card", limit: 3 }, { stripeAccount: acct });
console.log(`Karten auf customers.stripe_customer_id: ${pmsStored.data.length}`);
// Karten auf dem PI-Kunden?
if (pi.customer) {
  const pmsPi = await stripe.paymentMethods.list({ customer: pi.customer, type: "card", limit: 3 }, { stripeAccount: acct });
  console.log(`Karten auf PI.customer: ${pmsPi.data.length}`);
}
