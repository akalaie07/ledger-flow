import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordCheckout, recordRefund } from "@/lib/ledger/record-checkout";
import type { Json } from "@/lib/types/database";

// Stripe braucht den ROHEN Body für die Signaturprüfung — in App-Router-Route-
// Handlern liefert request.text() den unveränderten Body (kein Body-Parser
// dazwischen). Diese Route ist im Proxy ausgenommen (/api), läuft also ohne
// Auth-Redirect.
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET fehlt");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("[webhook] Signaturprüfung fehlgeschlagen:", (err as Error).message);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Rohes Event protokollieren. organization_id kommt — falls vorhanden — aus
  // den Session-Metadaten. ignoreDuplicates: bei erneutem Empfang kein Fehler.
  const orgFromEvent =
    (event.data.object as { metadata?: Record<string, string> }).metadata?.organization_id ?? null;

  await admin.from("webhook_events").upsert(
    {
      stripe_event_id: event.id,
      event_type: event.type,
      payload: JSON.parse(body) as Json,
      organization_id: orgFromEvent,
    },
    { onConflict: "stripe_event_id", ignoreDuplicates: true },
  );

  // Bereits FERTIG verarbeitet? (Dedup am Status, nicht am Empfang — ein zuvor
  // fehlgeschlagenes Event darf beim Stripe-Retry erneut laufen.)
  const { data: logged } = await admin
    .from("webhook_events")
    .select("processed_at")
    .eq("stripe_event_id", event.id)
    .maybeSingle();
  if (logged?.processed_at) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await recordCheckout(admin, event.data.object as Stripe.Checkout.Session);
    } else if (event.type === "charge.refunded") {
      // Erstattung → Deal stoppen, damit keine weiteren Raten abgebucht werden.
      await recordRefund(admin, event.data.object as Stripe.Charge);
    }

    await admin
      .from("webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("stripe_event_id", event.id);

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = (err as Error).message;
    console.error("[webhook] Verarbeitung fehlgeschlagen:", message);
    await admin.from("webhook_events").update({ error: message }).eq("stripe_event_id", event.id);
    // 500 → Stripe wiederholt; recordCheckout ist idempotent (Deal-Session-ID unique).
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}
