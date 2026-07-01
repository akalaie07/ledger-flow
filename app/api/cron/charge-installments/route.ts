import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { chargeDueInstallments } from "@/lib/ledger/charge-due-installments";

// Täglich aufzurufen (z. B. Vercel Cron). Geschützt über CRON_SECRET:
// Vercel sendet automatisch "Authorization: Bearer $CRON_SECRET"; für lokales
// Testen ist zusätzlich ?secret=... erlaubt.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");

  if (!secret || (auth !== `Bearer ${secret}` && querySecret !== secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const result = await chargeDueInstallments(admin);
    console.log("[cron] Raten-Abbuchung:", result);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[cron] Raten-Abbuchung fehlgeschlagen:", (err as Error).message);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
