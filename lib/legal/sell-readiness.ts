// Zentrale Prüfung, ob eine Organisation verkaufen darf. Verkauf ist erst
// erlaubt, wenn (1) Stripe verbunden ist, (2) die Pflichtangaben (Impressum
// als Verkäufer, § 5 DDG) vollständig sind und (3) der AVV angenommen wurde.
// Wird sowohl in den öffentlichen Kaufseiten als auch serverseitig im
// Checkout verwendet, damit die Sperre nicht über die UI umgangen werden kann.

export type SellReadinessInput = {
  stripe_account_id: string | null;
  legal_name: string | null;
  address_street: string | null;
  address_zip: string | null;
  address_city: string | null;
  contact_email: string | null;
  avv_accepted_at: string | null;
};

export function hasLegalInfo(org: SellReadinessInput): boolean {
  return !!(
    org.legal_name &&
    org.address_street &&
    org.address_zip &&
    org.address_city &&
    org.contact_email
  );
}

export function isSellReady(org: SellReadinessInput): boolean {
  return !!org.stripe_account_id && hasLegalInfo(org) && !!org.avv_accepted_at;
}

// Spalten, die für die Prüfung aus `organizations` geladen werden müssen —
// als eine Quelle, damit die SELECTs in den verschiedenen Seiten konsistent
// bleiben.
export const SELL_READINESS_COLUMNS =
  "stripe_account_id, legal_name, address_street, address_zip, address_city, contact_email, avv_accepted_at";
