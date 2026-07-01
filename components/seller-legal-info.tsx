type SellerLegalInfoProps = {
  name: string;
  legal_name: string | null;
  address_street: string | null;
  address_zip: string | null;
  address_city: string | null;
  address_country: string | null;
  contact_email: string | null;
  vat_id: string | null;
};

/** Impressum des Verkäufers (Organisation) — Pflichtangabe auf Storefront und Checkout, § 5 DDG. */
export function SellerLegalInfo({
  name,
  legal_name,
  address_street,
  address_zip,
  address_city,
  address_country,
  contact_email,
  vat_id,
}: SellerLegalInfoProps) {
  const isComplete = !!(legal_name && address_street && address_zip && address_city && contact_email);

  if (!isComplete) {
    return (
      <div className="mt-12 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-center text-xs text-warning">
        {name} hat noch keine vollständigen Pflichtangaben (Impressum) hinterlegt.
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-2xl border border-border bg-surface-2/40 px-6 py-5 text-center text-xs leading-relaxed text-muted-foreground">
      <p className="font-medium text-foreground">Verkäufer / Anbieter dieser Angebote</p>
      <p>{legal_name}</p>
      <p>
        {address_street}, {address_zip} {address_city}, {address_country}
      </p>
      <p>
        E-Mail: <a href={`mailto:${contact_email}`} className="hover:underline">{contact_email}</a>
        {vat_id ? ` · USt-IdNr.: ${vat_id}` : ""}
      </p>
    </div>
  );
}
