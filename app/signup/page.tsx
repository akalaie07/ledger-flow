import type { Metadata } from "next";
import Link from "next/link";

import { Wordmark } from "@/components/brand";
import { SignupForm } from "./_components/signup-form";

export const metadata: Metadata = { title: "Registrieren — Kalaie Ledger" };

export default function SignupPage() {
  return (
    <div className="relative grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      {/* Form panel */}
      <main className="bg-grid order-2 flex items-center justify-center px-5 py-12 lg:order-1">
        <div className="w-full max-w-sm animate-rise space-y-8">
          <div className="lg:hidden">
            <Wordmark />
          </div>

          <div className="space-y-1.5">
            <h1 className="font-display text-2xl tracking-tight text-foreground">Organisation erstellen</h1>
            <p className="text-sm text-muted-foreground">In einer Minute startklar — danach Stripe verbinden und verkaufen.</p>
          </div>

          <SignupForm />

          <p className="text-center text-sm text-muted-foreground">
            Schon ein Konto?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Anmelden
            </Link>
          </p>
        </div>
      </main>

      {/* Editorial right panel */}
      <aside className="ledger-rules relative order-1 hidden flex-col justify-between overflow-hidden border-l border-border bg-surface px-12 py-12 lg:order-2 lg:flex">
        <div
          className="pointer-events-none absolute -left-32 -top-32 size-[28rem] rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--primary-soft), transparent 70%)" }}
        />
        <div className="flex justify-end">
          <Wordmark sub="Sales Ledger" />
        </div>

        <div className="relative max-w-md space-y-6">
          <p className="font-display text-4xl leading-[1.15] tracking-tight text-foreground">
            Dein eigener Checkout.
            <span className="block text-muted-foreground italic">Automatisch verbucht.</span>
          </p>
          <ul className="space-y-3 text-[15px] text-muted-foreground">
            {["Produkte anlegen und Checkout-Links teilen", "Zahlungen laufen über dein eigenes Stripe-Konto", "Jeder Kauf wird automatisch zum Deal im Hauptbuch"].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="mt-0.5 size-4 shrink-0 stroke-primary" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 5 5L20 6" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative h-6" />
      </aside>
    </div>
  );
}
