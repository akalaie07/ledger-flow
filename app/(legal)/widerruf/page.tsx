import type { Metadata } from "next";

export const metadata: Metadata = { title: "Widerrufsbelehrung — Kalaie Ledger" };

export default function WiderrufPage() {
  return (
    <article className="space-y-5">
      <h1 className="font-display text-3xl tracking-tight text-foreground">Widerrufsbelehrung</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Verbraucher haben grundsätzlich ein 14-tägiges Widerrufsrecht. Unten steht das gesetzliche Muster als
        Ausgangspunkt — Verkäufer ist die jeweilige Organisation, daher müssen deren Daten (und die richtige Behandlung
        digitaler Inhalte/Dienstleistungen) eingesetzt werden. Final durch Rechtsberatung prüfen.
      </p>

      <section className="space-y-2">
        <h2 className="font-display text-lg tracking-tight text-foreground">Widerrufsrecht</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die
          Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses. Um Ihr Widerrufsrecht auszuüben,
          müssen Sie die verkaufende Organisation — deren Kontaktdaten am Ende der jeweiligen Storefront- bzw.
          Checkout-Seite als „Verkäufer / Anbieter dieser Angebote“ angezeigt werden — mittels einer eindeutigen
          Erklärung über Ihren Entschluss informieren.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg tracking-tight text-foreground">Erlöschen bei digitalen Inhalten / Dienstleistungen</h2>
        <p className="rounded-lg border border-dashed border-border bg-surface-2/40 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
          Wichtig für Coaching/Online-Produkte: Bei digitalen Inhalten und bei vorzeitig (auf Wunsch) begonnenen
          Dienstleistungen kann das Widerrufsrecht vorzeitig erlöschen — aber nur, wenn der Verbraucher dem ausdrücklich
          zugestimmt und seine Kenntnis vom Verlust bestätigt hat. Wie das im Checkout konkret abgefragt wird, mit der
          Rechtsberatung festlegen.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg tracking-tight text-foreground">Muster-Widerrufsformular</h2>
        <p className="rounded-lg border border-dashed border-border bg-surface-2/40 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
          Standardisiertes Formular (An … / Hiermit widerrufe(n) ich/wir … / bestellt am … / Name … / Unterschrift …)
          einsetzen, mit den Daten der jeweils verkaufenden Organisation.
        </p>
      </section>
    </article>
  );
}
