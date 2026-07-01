import "server-only";

import { createClient } from "@supabase/supabase-js";

import "@/lib/supabase/validate-env";
import type { Database } from "@/lib/types/database";

// Service-role client — bypasses RLS. Nur serverseitig für Webhook-Verarbeitung
// und den täglichen Raten-Abbuchungs-Job. Niemals den Service-Role-Key an den
// Client geben.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
