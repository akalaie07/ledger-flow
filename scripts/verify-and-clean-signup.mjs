// Verifiziert die Test-Registrierung und entfernt sie danach wieder.
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_EMAIL = "signup-test@example.com";

const { data: org } = await admin.from("organizations").select("id, name, slug").eq("slug", "test-coaching-gmbh").maybeSingle();
const { data: profile } = await admin.from("profiles").select("id, full_name, email, organization_id").eq("email", TEST_EMAIL).maybeSingle();

console.log("Organisation angelegt:", org ? `${org.name} (slug ${org.slug})` : "FEHLT");
console.log("Profil angelegt:", profile ? `${profile.full_name} <${profile.email}> org=${profile.organization_id}` : "FEHLT");
console.log("Verknüpfung stimmt:", org && profile && org.id === profile.organization_id);

// Aufräumen
if (profile) {
  await admin.auth.admin.deleteUser(profile.id);
  console.log("Auth-User gelöscht.");
}
if (org) {
  await admin.from("organizations").delete().eq("id", org.id);
  console.log("Organisation gelöscht (Profil per ON DELETE CASCADE entfernt).");
}
console.log("Test-Registrierung aufgeräumt.");
