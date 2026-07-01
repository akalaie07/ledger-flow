// Testet Phase 4 live: setzt die erste offene Rate des echten Raten-Deals auf
// heute fällig, stößt den Abbuchungs-Job an und prüft, ob sie automatisch von
// der gespeicherten Karte abgebucht wurde.
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const today = new Date().toISOString().slice(0, 10);

// Echten Raten-Deal (Session beginnt mit cs_test_a1 = Hosted Checkout, nicht Skript)
const { data: deal } = await admin
  .from("deals")
  .select("id, customers(name)")
  .eq("payment_type", "installments")
  .like("stripe_checkout_session_id", "cs_test_a1%")
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();
const cust = Array.isArray(deal.customers) ? deal.customers[0] : deal.customers;
console.log(`Deal: ${deal.id} (${cust?.name})`);

// Erste offene Rate auf heute fällig setzen
const { data: nextRate } = await admin
  .from("installments")
  .select("id, sequence, amount")
  .eq("deal_id", deal.id)
  .eq("paid", false)
  .order("sequence")
  .limit(1)
  .single();
await admin.from("installments").update({ due_date: today }).eq("id", nextRate.id);
console.log(`Rate #${nextRate.sequence} (${nextRate.amount} €) auf heute (${today}) fällig gesetzt.`);

// Abbuchungs-Job anstoßen
const res = await fetch(`http://localhost:3000/api/cron/charge-installments?secret=${encodeURIComponent(process.env.CRON_SECRET)}`);
console.log("\nJob-Antwort:", JSON.stringify(await res.json(), null, 2));

// Ergebnis prüfen
const { data: after } = await admin
  .from("installments")
  .select("sequence, amount, paid, paid_at, stripe_payment_intent_id")
  .eq("deal_id", deal.id)
  .order("sequence");
console.log("\nRaten nach dem Job:");
let paidSum = 0;
for (const i of after ?? []) {
  if (i.paid) paidSum += Number(i.amount);
  console.log(`  #${i.sequence}  ${Number(i.amount).toFixed(2)} €  ${i.paid ? "bezahlt" : "offen"}${i.stripe_payment_intent_id ? "  pi=" + i.stripe_payment_intent_id.slice(0, 18) : ""}`);
}
console.log(`\nBezahlt gesamt: ${paidSum.toFixed(2)} €`);
