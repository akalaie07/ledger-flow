// Legt (falls nötig) eine Platzhalter-Organisation an, dann einen Auth-User
// + passenden profiles-Eintrag dafür. Für die Beta reicht das manuelle Anlegen
// — kein Self-Service-Signup.
//
// Usage: node scripts/create-test-user.mjs <email> <password> [full_name]
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const [, , email, password, fullName] = process.argv;
if (!email || !password) {
  console.error("Usage: node scripts/create-test-user.mjs <email> <password> [full_name]");
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let { data: org } = await supabase.from("organizations").select("id, name").limit(1).maybeSingle();

if (!org) {
  const { data: created, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: "Pilot-Organisation", slug: "pilot-organisation" })
    .select("id, name")
    .single();
  if (orgError) {
    console.error("Organisation anlegen fehlgeschlagen:", orgError.message);
    process.exit(1);
  }
  org = created;
  console.log(`Platzhalter-Organisation angelegt: "${org.name}" (${org.id}) — kann jederzeit umbenannt werden.`);
} else {
  console.log(`Bestehende Organisation verwendet: "${org.name}" (${org.id})`);
}

const { data: userResult, error: userError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (userError) {
  console.error("User anlegen fehlgeschlagen:", userError.message);
  process.exit(1);
}

const { error: profileError } = await supabase.from("profiles").insert({
  id: userResult.user.id,
  organization_id: org.id,
  email,
  full_name: fullName ?? null,
});

if (profileError) {
  console.error("Profil anlegen fehlgeschlagen:", profileError.message);
  process.exit(1);
}

console.log(`Fertig — ${email} kann sich jetzt einloggen, Organisation "${org.name}".`);
