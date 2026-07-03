# Rechtliches — Status & Anwalts-Fahrplan (Kalaie Ledger)

> **Wichtig:** Dieses Dokument ist eine technische/inhaltliche Bestandsaufnahme, **keine
> Rechtsberatung**. Alle Texte sind fundierte Entwürfe. Die mit „ANWALT" markierten
> Punkte müssen vor einem echten Live-Betrieb mit relevantem Umsatz anwaltlich
> abgenommen werden.
>
> Stand: Juli 2026 · Rechtsform Anbieter: Einzelunternehmen (Amir Kalaie), Kleinunternehmer § 19 UStG · Zielmarkt Beta: DACH

## Modell in einem Satz

Kalaie Ledger ist eine **Software-Plattform** (Stripe Connect). Die Organisationen sind
**Verkäufer** und Vertragspartner ihrer Endkunden; Kalaie Ledger ist **nicht** Verkäufer,
**nicht** Merchant of Record und **kein** Zahlungsdienstleister. Geld fließt direkt vom
Endkunden auf das Stripe-Konto der Organisation.

---

## 1. Ebene: Anbieter (du) — erledigt

- [x] **Impressum** (`/impressum`) — echte Daten, § 5 DDG, § 18 MStV, Kleinunternehmer-Hinweis § 19 UStG, OS-Plattform-Link, Klarstellung Plattformrolle
- [x] **Datenschutzerklärung** (`/datenschutz`) — DSGVO, Rollen Verantwortlicher/Auftragsverarbeiter getrennt, Subprozessoren (Supabase, Vercel, Stripe), Betroffenenrechte
- [x] **AGB** (`/agb`) — Plattform-Nutzungsvertrag mit Organisationen, Rolle klargestellt, Beta kostenlos, Haftung, Kündigung, Gerichtsstand
- [x] **AVV / DPA** (`/avv`) — Art. 28 DSGVO zwischen dir und den Organisationen
- [x] **Kein Cookie-Consent nötig** — es werden nur technisch notwendige Login-Cookies (Supabase) gesetzt, kein Tracking/Analytics im Code

## 2. Ebene: Organisationen (deine Kunden) — erledigt

- [x] **Nur Unternehmer** (§ 14 BGB) — Pflicht-Bestätigung beim Signup, Zeitstempel gespeichert (`terms_accepted_at`, `acts_as_business`)
- [x] **AGB + Datenschutz-Zustimmung** beim Signup (Nachweis über Zeitstempel)
- [x] **Eigene Pflichtangaben** (Impressum als Verkäufer) in den Einstellungen erfassbar: Firmierung, Adresse, Kontakt-E-Mail, USt-IdNr.
- [x] **AVV-Annahme** in den Einstellungen (Zeitstempel `avv_accepted_at`)

## 3. Ebene: Endkunden (Kunden der Organisationen) — erledigt

- [x] **Verkäufer-Impressum** wird automatisch auf Storefront (`/s/...`) und Checkout (`/buy/...`) angezeigt
- [x] **Widerrufsbelehrung** (`/widerruf`) — verweist auf die Verkäuferdaten; Hinweis zum Erlöschen bei digitalen Inhalten/Dienstleistungen
- [x] **Checkout-Text** korrigiert: Kaufvertrag kommt mit der Organisation zustande, nicht mit Kalaie Ledger

## 4. Technische Durchsetzung — erledigt

- [x] **Verkaufssperre**: Kaufbuttons erscheinen erst, wenn Stripe verbunden **und** Pflichtangaben **und** AVV vollständig sind (`lib/legal/sell-readiness.ts`)
- [x] Sperre greift **serverseitig** im Checkout (`startCheckout`), nicht nur in der UI — nicht umgehbar
- [x] Warnhinweis in den Einstellungen, solange Verkauf nicht aktiv
- [x] **Widerrufs-Zustimmung im Checkout**: Kunde bestätigt ausdrücklich den sofortigen Leistungsbeginn und das Erlöschen des Widerrufsrechts (§ 356 Abs. 4/5 BGB); Nachweis in den Stripe-Session-Metadaten
- [x] **Keine Abbuchung nach Storno/Erstattung**: Raten-Job überspringt Deals mit `refunded`/`cancelled`; `charge.refunded`-Webhook markiert den Deal automatisch
- [x] **Beleg-Mail bei jeder Raten-Abbuchung** (`receipt_email`) — keine unangekündigten Abbuchungen
- [x] **Stopp nach 3 Fehlversuchen** statt endloser täglicher Wiederholung
- [x] **CSV-Datenexport** in den Einstellungen (`/api/export`) — erfüllt die in AGB/AVV zugesagte Exportmöglichkeit
- [x] **Rechtslinks auf Login/Signup** — Impressum von jeder Seite erreichbar

---

## 5. Offen — ANWALT / To-do vor echtem Live-Betrieb

Priorität: 🔴 hoch · 🟡 mittel · 🟢 niedrig

- 🔴 **ANWALT: Endabnahme aller fünf Dokumente** (Impressum, Datenschutz, AGB, AVV, Widerruf). Entwürfe sind praxisnah, aber nicht anwaltlich geprüft. Fixpreis-Pakete z. B. bei eRecht24 / IT-Recht Kanzlei.
- 🔴 **ANWALT: Haftungsklausel AGB § 7** — Haftungsbeschränkungen sind AGB-rechtlich (§§ 305 ff. BGB) besonders fehleranfällig; unwirksame Klauseln können die ganze Klausel kippen.
- 🔴 **STRIPE-EINSTELLUNG: `charge.refunded` als Webhook-Event aktivieren.** Der Refund-Handler ist im Code, aber der Connect-Webhook-Endpunkt in Stripe ist aktuell nur auf `checkout.session.completed` abonniert. Ohne `charge.refunded` (Scope „Connected accounts") wird der Deal bei einer Erstattung nicht automatisch gestoppt.
- 🟡 **Muster-Widerrufsformular** ausformulieren (aktuell nur beschrieben). Die Organisation als Verkäufer muss es ihren Kunden bereitstellen — ggf. pro Organisation generieren.
- 🟡 **Preisangaben (PAngV)**: Ob „inkl./zzgl. USt" korrekt ausgewiesen wird, hängt vom USt-Status der jeweiligen Organisation ab (nicht deiner). Aktuell nur genereller Hinweis. Bei regelbesteuerten Organisationen ggf. präzisieren.
- 🟢 **Auftragsverarbeitung mit Subprozessoren**: AVV mit Supabase, Vercel und Stripe abschließen/dokumentieren (jeweils über deren Standard-DPAs verfügbar). Prüfen, dass Supabase-Projekt in EU-Region läuft (aktuell konfiguriertes Projekt: EU/`eu-central-1` empfohlen).
- 🟢 **Drittlandtransfer**: Vercel (US) und Stripe (US-Bezug) über Standardvertragsklauseln absichern — in der Datenschutzerklärung bereits erwähnt, Nachweise ablegen.

## 6. Wenn ihr über DACH hinaus geht — späterer Fahrplan

- **EU-weit**: Widerrufsbelehrung + Kerninfos in der jeweiligen Kundensprache; ggf. länderspezifische Verbraucherinfos.
- **OSS/Umsatzsteuer**: Bei Verkäufen an Verbraucher in andere EU-Länder ist der Verkäufer (die Organisation) ggf. USt-pflichtig im Bestimmungsland (One-Stop-Shop). Betrifft die Organisationen, nicht dich — aber kommuniziere es.
- **Weltweit (Nicht-EU)**: lokales Verbraucherrecht, Steuern (US Sales Tax etc.), Sanktions-/Exportkontrolle. Erst mit spezialisierter Beratung.
- **Sobald Plattformgebühren erhoben werden**: AGB § 6 konkretisieren; bei B2B ins EU-Ausland Reverse-Charge + USt-IdNr.-Abfrage der Organisation; eigene Rechnungsstellung als (dann evtl. nicht mehr Klein-)Unternehmer.

## 7. Datenbank-Migrationen (manuell auszuführen)

Die MCP-Verbindung hängt nicht an der Produktions-DB — Migrationen bitte selbst einspielen:

- `supabase/migrations/0003_organization_legal_fields.sql` — Pflichtangaben-Felder *(bereits ausgeführt)*
- `supabase/migrations/0004_org_business_terms.sql` — Unternehmer-/AGB-Zustimmung **(noch ausführen)**

Danach ggf. `supabase gen types typescript` laufen lassen und `lib/types/database.ts` abgleichen.
