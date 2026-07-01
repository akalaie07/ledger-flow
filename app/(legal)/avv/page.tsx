import type { Metadata } from "next";

export const metadata: Metadata = { title: "AVV — Kalaie Ledger" };

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. Gegenstand und Dauer",
    body: [
      "Dieser Vertrag konkretisiert die Pflichten der Parteien im Zusammenhang mit der datenschutzrechtlichen Auftragsverarbeitung gemäß Art. 28 DSGVO, die sich aus der Nutzung der Plattform Kalaie Ledger durch die Organisation (nachfolgend „Verantwortliche“) ergibt.",
      "Auftragsverarbeiter ist Amir Kalaie, Palisadenstraße 35D, 10243 Berlin (siehe Impressum). Der Vertrag beginnt mit Annahme (Klick „AVV annehmen“ in den Einstellungen) und endet mit Beendigung des Nutzungsvertrags (AGB).",
    ],
  },
  {
    title: "2. Gegenstand, Art und Zweck der Verarbeitung",
    body: [
      "Verarbeitet werden Stammdaten der Endkundinnen und -kunden der Verantwortlichen (Name, E-Mail-Adresse, Telefonnummer, Stripe-Kunden-ID), Kauf- und Zahlungsdaten (Produkt, Preis, Zahlungsstatus, Ratenpläne) sowie technische Metadaten aus Checkout und Webhook-Verarbeitung.",
      "Zweck ist ausschließlich die Bereitstellung der Plattformfunktionen der Verantwortlichen: Checkout-Vermittlung, Kundenverwaltung, Zahlungs- und Ratenverfolgung (Ledger).",
      "Kategorien betroffener Personen: Endkundinnen und -kunden der Verantwortlichen, die über deren Storefront kaufen.",
    ],
  },
  {
    title: "3. Weisungsgebundenheit",
    body: [
      "Der Auftragsverarbeiter verarbeitet personenbezogene Daten ausschließlich auf dokumentierte Weisung der Verantwortlichen, es sei denn, er ist durch Unionsrecht oder das Recht der Mitgliedstaaten zu einer anderweitigen Verarbeitung verpflichtet. Die Nutzung der Plattformfunktionen entsprechend ihrer bestimmungsgemäßen Funktion gilt als Weisung.",
    ],
  },
  {
    title: "4. Technische und organisatorische Maßnahmen",
    body: [
      "Zugriff auf die Datenbank ist durch rollenbasierte Zugriffskontrolle (Row-Level-Security) auf die jeweils eigene Organisation beschränkt; Verbindungen erfolgen verschlüsselt (TLS).",
      "Zahlungsdaten im engeren Sinne (Kartendaten) werden nicht auf eigenen Systemen gespeichert, sondern ausschließlich bei Stripe verarbeitet.",
      "Zugangsdaten werden gehasht gespeichert; Änderungen an Kern-Tabellen werden protokolliert (Zeitstempel je Datensatz).",
    ],
  },
  {
    title: "5. Unterauftragsverarbeiter",
    body: [
      "Die Verantwortliche stimmt dem Einsatz folgender Unterauftragsverarbeiter zu: Supabase (Datenbank/Hosting), Vercel Inc. (Applikations-Hosting), Stripe (Zahlungsabwicklung).",
      "Der Auftragsverarbeiter informiert die Verantwortliche über beabsichtigte Änderungen in Bezug auf die Hinzuziehung oder Ersetzung weiterer Unterauftragsverarbeiter; die Verantwortliche kann diesen Änderungen aus wichtigem Grund widersprechen.",
    ],
  },
  {
    title: "6. Unterstützungspflichten",
    body: [
      "Der Auftragsverarbeiter unterstützt die Verantwortliche im Rahmen des Zumutbaren bei der Erfüllung von Betroffenenrechten (Art. 12–23 DSGVO), bei der Gewährleistung der Sicherheit der Verarbeitung (Art. 32), bei Meldungen von Datenschutzverletzungen (Art. 33, 34) sowie bei Datenschutz-Folgenabschätzungen (Art. 35).",
      "Wird der Auftragsverarbeiter von einer betroffenen Person direkt kontaktiert, leitet er die Anfrage unverzüglich an die Verantwortliche weiter, soweit er sie nicht selbst der Verantwortlichen zurechnen und beantworten kann.",
    ],
  },
  {
    title: "7. Meldepflichten",
    body: [
      "Der Auftragsverarbeiter meldet der Verantwortlichen Verletzungen des Schutzes personenbezogener Daten, die die von ihm verarbeiteten Daten betreffen, unverzüglich, spätestens jedoch innerhalb von 48 Stunden nach Kenntniserlangung.",
    ],
  },
  {
    title: "8. Löschung und Rückgabe",
    body: [
      "Nach Beendigung des Nutzungsvertrags löscht der Auftragsverarbeiter sämtliche personenbezogenen Daten der Verantwortlichen, soweit nicht gesetzliche Aufbewahrungspflichten entgegenstehen. Die Verantwortliche kann innerhalb von 30 Tagen nach Vertragsende einen Datenexport verlangen.",
    ],
  },
  {
    title: "9. Kontrollrechte",
    body: [
      "Die Verantwortliche ist berechtigt, sich in angemessenem Umfang von der Einhaltung der in diesem Vertrag festgelegten Pflichten zu überzeugen, insbesondere durch Einholung von Auskünften. Vor-Ort-Kontrollen sind mit angemessener Frist anzukündigen.",
    ],
  },
];

export default function AvvPage() {
  return (
    <article className="space-y-5">
      <h1 className="font-display text-3xl tracking-tight text-foreground">
        Vertrag zur Auftragsverarbeitung (AVV)
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Stand: Juli 2026. Gilt zwischen der registrierten Organisation als Verantwortlicher und Kalaie Ledger als
        Auftragsverarbeiter im Sinne von Art. 28 DSGVO. Die Annahme erfolgt in den Einstellungen.
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
