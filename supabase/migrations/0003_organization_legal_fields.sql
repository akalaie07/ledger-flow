-- =============================================================================
-- Pflichtangaben der Organisation (Verkäuferin gegenüber ihren Endkunden)
--
-- Organisationen verkaufen über ihre Storefront (/s/<slug>) direkt an ihre
-- eigenen Endkunden — sie sind Verkäuferin und damit selbst impressums- und
-- widerrufspflichtig (§ 5 DDG, Art. 246a EGBGB). Bisher gab es dafür kein
-- Datenfeld. legal_name/address_*/contact_email sind bewusst nullable, damit
-- bestehende Organisationen nicht brechen — die Storefront blendet den
-- Impressumsblock nur ein, wenn die Pflichtfelder vollständig sind (siehe
-- app/s/[slug]/page.tsx), und das Setzen dieser Felder ist Voraussetzung für
-- den Checkout-Start (Produktverkauf).
-- =============================================================================

alter table organizations
  add column legal_name text,
  add column address_street text,
  add column address_zip text,
  add column address_city text,
  add column address_country text not null default 'DE',
  add column contact_email text,
  add column vat_id text,
  add column avv_accepted_at timestamptz;

-- Organisationen dürfen ihre eigenen Pflichtangaben selbst pflegen.
create policy organizations_update_own
  on organizations for update
  using (id = auth_org_id())
  with check (id = auth_org_id());

grant update (
  legal_name, address_street, address_zip, address_city, address_country,
  contact_email, vat_id, avv_accepted_at
) on organizations to authenticated;
