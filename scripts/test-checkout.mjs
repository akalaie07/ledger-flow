// End-to-End-Smoke-Test für Phase 2: legt (falls nötig) ein Testprodukt für die
// Pilot-Organisation an und erzeugt eine echte Stripe-Checkout-Session AUF DEM
// verbundenen Konto — exakt der Pfad, den die /buy-Seite nutzt.
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const { data: org } = await supabase
  .from("organizations")
  .select("id, name, stripe_account_id")
  .not("stripe_account_id", "is", null)
  .limit(1)
  .single();

if (!org) {
  console.error("Keine Organisation mit verbundenem Stripe-Konto gefunden.");
  process.exit(1);
}
console.log(`Organisation: ${org.name} (Stripe ${org.stripe_account_id})`);

// Testprodukt sicherstellen (eines one_time, eines installments)
let { data: products } = await supabase.from("products").select("*").eq("organization_id", org.id);
if (!products?.length) {
  const { data: created, error } = await supabase
    .from("products")
    .insert([
      { organization_id: org.id, name: "Sales Masterclass", description: "Kompletter Kurs inkl. Community-Zugang.", price_amount: 497, payment_type: "one_time" },
      { organization_id: org.id, name: "Mentoring Programm", description: "6 Monate 1:1-Begleitung.", price_amount: 3000, payment_type: "installments", down_payment: 600, installment_count: 6, installment_interval_days: 30 },
    ])
    .select();
  if (error) {
    console.error("Produkt anlegen fehlgeschlagen:", error.message);
    process.exit(1);
  }
  products = created;
  console.log(`${created.length} Testprodukte angelegt.`);
} else {
  console.log(`${products.length} Produkte bereits vorhanden.`);
}

// Für jedes Produkt eine Checkout-Session auf dem verbundenen Konto erzeugen
for (const product of products) {
  const isInstallment = product.payment_type === "installments";
  const chargeNow = isInstallment ? Number(product.down_payment ?? 0) : Number(product.price_amount);

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(chargeNow * 100),
            product_data: { name: isInstallment ? `${product.name} — Anzahlung` : product.name },
          },
        },
      ],
      customer_creation: "always",
      payment_intent_data: isInstallment ? { setup_future_usage: "off_session" } : undefined,
      success_url: "http://localhost:3000/checkout/success",
      cancel_url: "http://localhost:3000/buy/" + product.id,
    },
    { stripeAccount: org.stripe_account_id },
  );

  console.log(`✓ ${product.name}: Session ${session.id} → ${session.url ? "URL erhalten" : "KEINE URL"}`);
}

console.log("\nCheckout-Pfad funktioniert. Buy-Links:");
for (const product of products) console.log(`  http://localhost:3000/buy/${product.id}`);
