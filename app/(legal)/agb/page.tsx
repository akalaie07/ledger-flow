import type { Metadata } from "next";

export const metadata: Metadata = { title: "AGB — Kalaie Ledger" };

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. Geltungsbereich",
    body: [
      "Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Software-Plattform Kalaie Ledger durch Organisationen, die sich registrieren, um eigene Produkte an ihre Kundinnen und Kunden zu verkaufen (nachfolgend „Organisation“).",
      "Die Plattform richtet sich ausschließlich an Unternehmer im Sinne von § 14 BGB. Mit der Registrierung bestätigt die Organisation, dass sie in Ausübung ihrer gewerblichen oder selbständigen beruflichen Tätigkeit handelt. Ein Angebot an Verbraucher als Plattformnutzer erfolgt nicht.",
      "Anbieterin der Plattform ist Amir Kalaie, Palisadenstraße 35D, 10243 Berlin (siehe Impressum). Diese AGB gelten nicht im Verhältnis zwischen einer Organisation und deren eigenen Endkundinnen/-kunden — dieses Verhältnis regelt die Organisation selbst.",
      "Organisationen mit Sitz in Österreich oder der Schweiz nutzen die Plattform ebenfalls als Unternehmer und sind selbst dafür verantwortlich, die für sie geltenden nationalen Vorschriften (z. B. österreichisches ECG/KSchG bzw. schweizerisches OR/UWG) gegenüber ihren Endkunden einzuhalten.",
    ],
  },
  {
    title: "2. Vertragsgegenstand & Rolle der Plattform",
    body: [
      "Kalaie Ledger stellt eine Software bereit, mit der Organisationen Produkte verwalten, Checkouts über Stripe anbieten und Zahlungen/Ratenzahlungen nachverfolgen können (Ledger-Funktion).",
      "Kalaie Ledger ist nicht Verkäuferin der über die Plattform angebotenen Produkte, nicht Vertragspartnerin der Endkundinnen und -kunden und kein Zahlungsdienstleister. Verkäuferin ist ausschließlich die jeweilige Organisation; Zahlungen laufen über das von der Organisation angebundene Stripe-Konto (Stripe Connect) direkt an die Organisation.",
    ],
  },
  {
    title: "3. Registrierung & Konto",
    body: [
      "Die Registrierung setzt voraus, dass die Organisation wahrheitsgemäße und vollständige Angaben macht, insbesondere die zur Erfüllung eigener rechtlicher Pflichten erforderlichen Angaben (siehe § 5).",
      "Zugangsdaten sind vertraulich zu behandeln. Die Organisation haftet für Handlungen, die unter Verwendung ihrer Zugangsdaten vorgenommen werden, soweit sie deren Missbrauch zu vertreten hat.",
    ],
  },
  {
    title: "4. Zahlungsabwicklung",
    body: [
      "Zahlungen der Endkundinnen und -kunden werden über Stripe abgewickelt und fließen direkt auf das von der Organisation verbundene Stripe-Konto. Es gelten zusätzlich die Nutzungsbedingungen von Stripe.",
      "Kalaie Ledger vereinnahmt, verwahrt oder leitet zu keinem Zeitpunkt Kundengelder weiter und ist nicht Zahlungsdienstleister im Sinne des ZAG.",
    ],
  },
  {
    title: "5. Pflichten der Organisation",
    body: [
      "Die Organisation ist als Verkäuferin allein verantwortlich für die Rechtmäßigkeit ihrer Produkte und Angebote sowie für die Einhaltung sämtlicher gegenüber ihren Endkundinnen und -kunden bestehenden Pflichten, insbesondere Impressumspflicht, Widerrufsrecht, Preisangaben, AGB und steuerliche Pflichten.",
      "Die Organisation stellt in ihrem Storefront auf der Plattform ein eigenes, korrektes Impressum sowie eigene Verbraucherinformationen bereit und hält diese aktuell.",
      "Die Organisation stellt sicher, dass ihre Nutzung der Plattform nicht gegen geltendes Recht, Rechte Dritter oder die Nutzungsbedingungen von Stripe verstößt.",
    ],
  },
  {
    title: "6. Vergütung / Plattformgebühren",
    body: [
      "Die Nutzung der Plattform ist derzeit während der Beta-Phase kostenlos. Kalaie Ledger behält sich vor, künftig Plattformgebühren einzuführen; Art und Höhe werden den Organisationen vorab in Textform mitgeteilt, mit angemessener Vorlaufzeit vor Inkrafttreten.",
    ],
  },
  {
    title: "7. Haftung",
    body: [
      "Kalaie Ledger haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie nach Maßgabe des Produkthaftungsgesetzes, bei Verletzung von Leben, Körper oder Gesundheit.",
      "Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) ist die Haftung auf den vertragstypisch vorhersehbaren Schaden begrenzt; im Übrigen ist die Haftung für leichte Fahrlässigkeit ausgeschlossen.",
      "Kalaie Ledger haftet nicht für Inhalte, Rechtmäßigkeit oder Erfüllung der von Organisationen angebotenen Produkte und Leistungen sowie nicht für Ausfälle oder Fehlverhalten von Drittdiensten (insbesondere Stripe, Supabase, Vercel), soweit diese nicht von Kalaie Ledger zu vertreten sind.",
    ],
  },
  {
    title: "8. Laufzeit & Kündigung",
    body: [
      "Der Nutzungsvertrag läuft auf unbestimmte Zeit und kann von beiden Seiten jederzeit mit einer Frist von 14 Tagen zum Monatsende in Textform (z. B. E-Mail) gekündigt werden. Das Recht zur fristlosen Kündigung aus wichtigem Grund bleibt unberührt.",
      "Nach Beendigung erhält die Organisation für 30 Tage die Möglichkeit, ihre Daten zu exportieren; danach werden die Daten gelöscht, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.",
    ],
  },
  {
    title: "9. Schlussbestimmungen",
    body: [
      "Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Ist die Organisation Kauffrau/Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist Gerichtsstand Berlin.",
      "Änderungen dieser AGB werden der Organisation mit angemessener Frist in Textform mitgeteilt; widerspricht die Organisation nicht innerhalb von 14 Tagen und nutzt die Plattform weiter, gelten die Änderungen als angenommen. Auf dieses Widerspruchsrecht wird in der Änderungsmitteilung gesondert hingewiesen.",
      "Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.",
    ],
  },
];

export default function AgbPage() {
  return (
    <article className="space-y-5">
      <h1 className="font-display text-3xl tracking-tight text-foreground">Allgemeine Geschäftsbedingungen</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Stand: Juli 2026. Diese AGB regeln das Verhältnis zwischen Kalaie Ledger und den nutzenden Organisationen.
      </p>
      {sections.map((s) => (
        <section key={s.title} className="space-y-1.5">
          <h2 className="font-display text-lg tracking-tight text-foreground">{s.title}</h2>
          {s.body.map((p) => (
            <p key={p} className="text-sm leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
