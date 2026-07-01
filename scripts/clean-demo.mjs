// Entfernt den Fake-Demo-Deal "Max Mustermann" (Webhook-Skript-Test mit Fake-
// Karte), damit der Account als sauberes Demo herhalten kann. Echte Käufe und
// Produkte bleiben unangetastet.
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Fake-Kunden (vom Webhook-Test) finden
const { data: fakeCustomers } = await admin.from("customers").select("id, email").like("email", "webhook-test+%");
if (!fakeCustomers?.length) {
  console.log("Keine Fake-Test-Kunden gefunden — nichts zu tun.");
  process.exit(0);
}

for (const c of fakeCustomers) {
  // Deals löschen (installments per ON DELETE CASCADE), dann Kunde
  const { data: deals } = await admin.from("deals").select("id").eq("customer_id", c.id);
  for (const d of deals ?? []) {
    await admin.from("deals").delete().eq("id", d.id);
  }
  await admin.from("customers").delete().eq("id", c.id);
  console.log(`Entfernt: ${c.email} (${deals?.length ?? 0} Deal(s))`);
}

// Übrigen Stand zeigen
const { data: remaining } = await admin
  .from("deals")
  .select("total_price, customers(name), products(name)")
  .order("created_at", { ascending: false });
console.log("\nVerbleibende Deals:");
for (const d of remaining ?? []) {
  const c = Array.isArray(d.customers) ? d.customers[0] : d.customers;
  const p = Array.isArray(d.products) ? d.products[0] : d.products;
  console.log(`  ${c?.name} — ${p?.name} — ${d.total_price} €`);
}
