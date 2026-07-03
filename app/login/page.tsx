import type { Metadata } from "next";
import Link from "next/link";

import { Wordmark } from "@/components/brand";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = { title: "Anmelden — Kalaie Ledger" };

export default function LoginPage() {
  return (
    <div className="relative grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Editorial left panel */}
      <aside className="ledger-rules relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface px-12 py-12 lg:flex">
        <div
          className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--primary-soft), transparent 70%)" }}
        />
        <Wordmark sub="Sales Ledger" />

        <div className="relative max-w-md space-y-6">
          <p className="font-display text-4xl leading-[1.15] tracking-tight text-foreground">
            Verkaufen und verbuchen.
            <span className="block text-muted-foreground italic">In einem Fluss.</span>
          </p>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            Kunden kaufen direkt über Kalaie Ledger — Zahlung, Kunde, Deal und offene Forderung
            entstehen automatisch im Hauptbuch. Kein CSV-Export, kein manuelles Nachtragen.
          </p>
        </div>

        <dl className="relative grid grid-cols-3 gap-6 border-t border-border pt-7 text-foreground">
          {[
            ["100%", "automatisch verbucht"],
            ["0", "CSV-Importe nötig"],
            ["Stripe", "sichere Zahlung"],
          ].map(([n, l]) => (
            <div key={l}>
              <dt className="font-display text-2xl tracking-tight tabular-nums">{n}</dt>
              <dd className="mt-1 text-xs leading-snug text-faint">{l}</dd>
            </div>
          ))}
        </dl>
      </aside>

      {/* Form panel */}
      <main className="bg-grid flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm animate-rise space-y-8">
          <div className="lg:hidden">
            <Wordmark />
          </div>

          <div className="space-y-1.5">
            <h1 className="font-display text-2xl tracking-tight text-foreground">Willkommen zurück</h1>
            <p className="text-sm text-muted-foreground">Melde dich an, um dein Hauptbuch zu öffnen.</p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-muted-foreground">
            Noch kein Konto?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Organisation erstellen
            </Link>
          </p>

          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-faint">
            <Link href="/impressum" className="hover:text-muted-foreground hover:underline">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-muted-foreground hover:underline">Datenschutz</Link>
            <Link href="/agb" className="hover:text-muted-foreground hover:underline">AGB</Link>
          </nav>
        </div>
      </main>
    </div>
  );
}
