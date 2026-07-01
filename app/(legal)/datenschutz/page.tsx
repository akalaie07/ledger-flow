import type { Metadata } from "next";

export const metadata: Metadata = { title: "Datenschutz — Kalaie Ledger" };

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. Verantwortlicher",
    body: [
      "Verantwortlicher im Sinne der DSGVO für den Betrieb der Plattform Kalaie Ledger ist:",
      "Amir Kalaie, Palisadenstraße 35D, 10243 Berlin, Deutschland, E-Mail: akdigitalsolutions.kontakt@gmail.com.",
      "Für Kaufabwicklungen auf den Storefronts einzelner Organisationen (/s/<organisation>) ist die jeweilige Organisation eigener Verantwortlicher gegenüber ihren Kundinnen und Kunden — siehe Abschnitt 5.",
    ],
  },
  {
    title: "2. Welche Daten wir verarbeiten",
    body: [
      "Konto- und Organisationsdaten: Name, E-Mail-Adresse, Passwort (gehasht), Organisationsname, verbundenes Stripe-Konto.",
      "Produkt- und Verkaufsdaten: Produktangaben, Preise, Bestellungen, Ratenpläne (Deals/Installments).",
      "Kundendaten der Organisationen: Name, E-Mail, Telefonnummer, Stripe-Kunden-ID der Käuferinnen und Käufer eines Shops.",
      "Zahlungsdaten: Zahlungsstatus, Beträge, Stripe-Referenzen (Checkout-Session-, Payment-Intent-IDs). Kartendaten selbst werden ausschließlich von Stripe verarbeitet und laufen nicht über unsere Server.",
      "Technische Daten: Server- und Zugriffslogs (IP-Adresse, Zeitstempel, aufgerufene URL) zur Sicherstellung von Betrieb und Sicherheit.",
    ],
  },
  {
    title: "3. Zwecke & Rechtsgrundlagen",
    body: [
      "Bereitstellung der Plattform und Vertragserfüllung mit registrierten Organisationen — Art. 6 Abs. 1 lit. b DSGVO.",
      "Verarbeitung von Kundendaten im Auftrag der Organisationen zur Abwicklung von deren Verkäufen — Art. 6 Abs. 1 lit. b i. V. m. Art. 28 DSGVO (wir handeln hier als Auftragsverarbeiter, siehe Abschnitt 5).",
      "Betrieb, Sicherheit und Missbrauchsprävention der Plattform — berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO.",
      "Erfüllung gesetzlicher Pflichten (z. B. handels- und steuerrechtliche Aufbewahrung) — Art. 6 Abs. 1 lit. c DSGVO.",
    ],
  },
  {
    title: "4. Empfänger & eingesetzte Dienstleister",
    body: [
      "Supabase (Datenbank, Authentifizierung, Hosting der Datenbank) — Verarbeitung auf Grundlage eines Auftragsverarbeitungsvertrags mit Supabase.",
      "Vercel Inc. (Hosting/Ausführung der Web-Anwendung) — Verarbeitung auf Grundlage eines Auftragsverarbeitungsvertrags mit Vercel.",
      "Stripe (Zahlungsabwicklung, inkl. Stripe Connect für die Organisationen) — eigener Verantwortlicher für die Zahlungsabwicklung, mit dem ebenfalls ein Auftragsverarbeitungsvertrag besteht, soweit Stripe für uns Daten verarbeitet.",
      "Soweit diese Anbieter Daten außerhalb der EU/des EWR (insbesondere USA) verarbeiten, stützen wir den Transfer auf EU-Standardvertragsklauseln bzw. ein anerkanntes Angemessenheitsniveau der jeweiligen Anbieter.",
    ],
  },
  {
    title: "5. Unsere Rolle als Auftragsverarbeiter gegenüber Organisationen",
    body: [
      "Für Kundendaten, die eine Organisation über die Plattform sammelt und verarbeitet (z. B. Namen, E-Mail-Adressen und Kaufhistorie ihrer Endkundinnen und -kunden), ist die jeweilige Organisation datenschutzrechtlich Verantwortliche, Kalaie Ledger handelt als Auftragsverarbeiter im Sinne von Art. 28 DSGVO.",
      "Mit jeder Organisation wird beim Onboarding ein Auftragsverarbeitungsvertrag (AVV) geschlossen; die Bedingungen finden sich unter „AVV“ in der Fußzeile.",
      "Organisationen sind gegenüber ihren eigenen Kundinnen und Kunden verpflichtet, eine eigene Datenschutzerklärung sowie ein eigenes Impressum bereitzustellen.",
    ],
  },
  {
    title: "6. Speicherdauer",
    body: [
      "Konto- und Organisationsdaten werden für die Dauer der Vertragsbeziehung gespeichert und danach gelöscht, soweit keine gesetzlichen Aufbewahrungsfristen (insbesondere handels- und steuerrechtlich, i. d. R. 6–10 Jahre für Buchungs- und Rechnungsdaten) entgegenstehen.",
      "Server-Logs werden nach spätestens 30 Tagen automatisch gelöscht oder anonymisiert, soweit sie nicht zur Aufklärung eines konkreten Sicherheitsvorfalls benötigt werden.",
    ],
  },
  {
    title: "7. Ihre Rechte als betroffene Person",
    body: [
      "Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch gegen die Verarbeitung (Art. 21 DSGVO).",
      "Zur Ausübung dieser Rechte genügt eine formlose Nachricht an akdigitalsolutions.kontakt@gmail.com. Wenden sich Endkundinnen/-kunden einer Organisation an uns, leiten wir die Anfrage ggf. an die zuständige Organisation als Verantwortliche weiter.",
      "Sie haben zudem das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren, z. B. bei der Berliner Beauftragten für Datenschutz und Informationsfreiheit.",
    ],
  },
];

export default function DatenschutzPage() {
  return (
    <article className="space-y-5">
      <h1 className="font-display text-3xl tracking-tight text-foreground">Datenschutzerklärung</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Stand: Juli 2026. Diese Erklärung beschreibt, wie Kalaie Ledger personenbezogene Daten verarbeitet.
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
