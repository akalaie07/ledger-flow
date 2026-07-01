// End-to-End-Test Phase 3: baut ein signiertes checkout.session.completed-Event,
// schickt es an den echten Webhook-Endpunkt und prüft, ob Kunde + Deal + Raten
// korrekt im Hauptbuch landen. Testet außerdem Idempotenz (zweimal senden).
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const secret = process.env.STRIPE_WEBHOOK_SECRET;
const ENDPOINT = "http://localhost:3000/api/stripe/webhook";

// Ratenprodukt der Pilot-Org holen
const { data: product } = await supabase
  .from("products")
  .select("id, organization_id, name, price_amount, payment_type, down_payment, installment_count")
  .eq("payment_type", "installments")
  .limit(1)
  .single();
if (!product) {
  console.error("Kein Ratenprodukt gefunden — erst scripts/test-checkout.mjs laufen lassen.");
  process.exit(1);
}
console.log(`Testprodukt: ${product.name} (${product.price_amount} €, Anzahlung ${product.down_payment} €, ${product.installment_count} Raten)`);

const email = `webhook-test+${Date.now()}@example.com`;
const sessionId = `cs_test_wh_${Date.now()}`;

const event = {
  id: `evt_test_${Date.now()}`,
  object: "event",
  type: "checkout.session.completed",
  data: {
    object: {
      id: sessionId,
      object: "checkout.session",
      payment_status: "paid",
      customer: `cus_test_${Date.now()}`,
      payment_intent: `pi_test_${Date.now()}`,
      customer_details: { email, name: "Max Mustermann" },
      metadata: {
        product_id: product.id,
        organization_id: product.organization_id,
        payment_type: product.payment_type,
      },
    },
  },
};

const payload = JSON.stringify(event);
const header = stripe.webhooks.generateTestHeaderString({ payload, secret });

async function send(label) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json", "stripe-signature": header },
    body: payload,
  });
  console.log(`${label}: HTTP ${res.status} ${JSON.stringify(await res.json())}`);
}

await send("1. Senden");
await send("2. Senden (Idempotenz)");

// DB prüfen
const { data: customer } = await supabase
  .from("customers")
  .select("id, name, email, stripe_customer_id")
  .eq("email", email)
  .maybeSingle();
const { data: deal } = await supabase
  .from("deals")
  .select("id, total_price, payment_type, down_payment, customer_id")
  .eq("stripe_checkout_session_id", sessionId)
  .maybeSingle();
const { data: installments } = deal
  ? await supabase.from("installments").select("sequence, due_date, amount, paid").eq("deal_id", deal.id).order("sequence")
  : { data: [] };
const { count: dealCount } = await supabase
  .from("deals")
  .select("id", { count: "exact", head: true })
  .eq("stripe_checkout_session_id", sessionId);

console.log("\n--- Ergebnis ---");
console.log("Kunde:", customer ? `${customer.name} <${customer.email}> stripe=${customer.stripe_customer_id}` : "FEHLT");
console.log("Deal:", deal ? `Gesamt ${deal.total_price} €, Typ ${deal.payment_type}, Anzahlung ${deal.down_payment} €` : "FEHLT");
console.log(`Deals mit dieser Session-ID: ${dealCount} (muss 1 sein → Idempotenz ok)`);
console.log("Raten:");
let sum = 0;
for (const i of installments ?? []) {
  sum += Number(i.amount);
  console.log(`  #${i.sequence}  ${i.due_date}  ${Number(i.amount).toFixed(2)} €  ${i.paid ? "bezahlt" : "offen"}`);
}
console.log(`Summe aller Raten: ${sum.toFixed(2)} € (muss ${Number(product.price_amount).toFixed(2)} € sein)`);
