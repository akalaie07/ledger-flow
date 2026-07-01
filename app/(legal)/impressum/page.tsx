import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impressum — Kalaie Ledger" };

export default function ImpressumPage() {
  return (
    <article className="space-y-5">
      <h1 className="font-display text-3xl tracking-tight text-foreground">Impressum</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">Angaben gemäß § 5 DDG.</p>

      <section className="space-y-1 text-sm leading-relaxed text-foreground">
        <p>Amir Kalaie</p>
        <p>Palisadenstraße 35D</p>
        <p>10243 Berlin</p>
        <p>Deutschland</p>
      </section>

      <section className="space-y-1 text-sm leading-relaxed text-foreground">
        <h2 className="font-display text-lg tracking-tight text-foreground">Kontakt</h2>
        <p>E-Mail: akdigitalsolutions.kontakt@gmail.com</p>
      </section>

      <section className="space-y-1 text-sm leading-relaxed text-foreground">
        <h2 className="font-display text-lg tracking-tight text-foreground">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>Amir Kalaie, Anschrift wie oben.</p>
      </section>

      <section className="space-y-1 text-sm leading-relaxed text-foreground">
        <h2 className="font-display text-lg tracking-tight text-foreground">Umsatzsteuer</h2>
        <p>
          Gemäß § 19 Abs. 1 UStG wird keine Umsatzsteuer berechnet und ausgewiesen (Kleinunternehmerregelung).
        </p>
      </section>

      <section className="space-y-2 text-sm leading-relaxed text-foreground">
        <h2 className="font-display text-lg tracking-tight text-foreground">EU-Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
          <a href="https://ec.europa.eu/consumers/odr/" className="underline" target="_blank" rel="noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>
          . Unsere E-Mail-Adresse finden Sie oben unter Kontakt.
        </p>
        <p>
          Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>

      <section className="space-y-2 text-sm leading-relaxed text-foreground">
        <h2 className="font-display text-lg tracking-tight text-foreground">Hinweis zur Plattformrolle</h2>
        <p>
          Kalaie Ledger ist eine Software-Plattform, über die Organisationen eigene Produkte an ihre Kundinnen und
          Kunden verkaufen. Für Verkäufe, die über die Storefronts einzelner Organisationen (z. B. unter{" "}
          <code>/s/&lt;organisation&gt;</code>) abgeschlossen werden, ist die jeweilige Organisation Verkäuferin und
          Vertragspartnerin, nicht Amir Kalaie / Kalaie Ledger. Das gesonderte Impressum der Organisation finden Sie
          auf deren Storefront-Seite.
        </p>
      </section>

      <p className="text-xs leading-relaxed text-faint">
        Hinweis: Dieses Impressum wurde nach bestem Wissen erstellt, ersetzt aber keine anwaltliche Prüfung. Ändern
        sich Rechtsform, USt-Status oder Anschrift, ist dieser Text zeitnah zu aktualisieren.
      </p>
    </article>
  );
}
