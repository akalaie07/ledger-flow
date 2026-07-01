import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: deals } = await admin
  .from("deals")
  .select("id, total_price, payment_type, stripe_checkout_session_id, created_at, customers(name, email, stripe_customer_id), products(name)")
  .order("created_at", { ascending: false })
  .limit(3);

for (const d of deals ?? []) {
  const c = Array.isArray(d.customers) ? d.customers[0] : d.customers;
  const p = Array.isArray(d.products) ? d.products[0] : d.products;
  const { data: inst } = await admin.from("installments").select("sequence, amount, paid, paid_at, stripe_payment_intent_id").eq("deal_id", d.id).order("sequence");
  console.log(`\nDeal: ${p?.name} — ${d.total_price} € (${d.payment_type})`);
  console.log(`  Kunde: ${c?.name} <${c?.email}>  stripe=${c?.stripe_customer_id ?? "—"}`);
  console.log(`  Session: ${d.stripe_checkout_session_id}`);
  for (const i of inst ?? []) {
    console.log(`  Rate #${i.sequence}: ${Number(i.amount).toFixed(2)} € ${i.paid ? "bezahlt" : "offen"}${i.stripe_payment_intent_id ? " pi=" + i.stripe_payment_intent_id : ""}`);
  }
}

const { count } = await admin.from("webhook_events").select("id", { count: "exact", head: true }).not("processed_at", "is", null);
console.log(`\nVerarbeitete Webhook-Events gesamt: ${count}`);
