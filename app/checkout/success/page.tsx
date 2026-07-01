import type { Metadata } from "next";

import { Wordmark } from "@/components/brand";
import { PublicFooter } from "@/components/public-footer";

export const metadata: Metadata = { title: "Danke — Kalaie Ledger" };

export default function CheckoutSuccessPage() {
  return (
    <div className="ledger-rules relative min-h-dvh">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-70"
        style={{ background: "radial-gradient(60% 100% at 50% 0, var(--primary-soft), transparent 75%)" }}
      />
      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col px-5 py-8">
        <div className="flex justify-center">
          <Wordmark />
        </div>

        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="animate-rise space-y-6 rounded-2xl border border-border bg-surface p-8 text-center shadow-[var(--shadow-lift)]">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="size-7 stroke-success" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5L20 6" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h1 className="font-display text-2xl tracking-tight text-foreground">Zahlung erfolgreich</h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Vielen Dank für deinen Kauf. Eine Bestätigung mit allen Details bekommst du per E-Mail von Stripe.
              </p>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-faint">Du kannst dieses Fenster jetzt schließen.</p>
        </div>

        <PublicFooter />
      </div>
    </div>
  );
}
