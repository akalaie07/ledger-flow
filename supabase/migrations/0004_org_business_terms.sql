-- =============================================================================
-- Unternehmer-Bestätigung & Plattform-AGB-Zustimmung beim Onboarding
--
-- Die Plattform richtet sich ausschließlich an Unternehmer (§ 14 BGB). Beim
-- Signup bestätigt die Organisation das und akzeptiert AGB + Datenschutz;
-- terms_accepted_at hält den Zeitpunkt als Nachweis fest. Beide Felder werden
-- serverseitig beim Signup (Service-Role-Client) gesetzt, daher kein zusätz
-- licher Grant für `authenticated` — Nutzer sollen ihren eigenen Zustimmungs-
-- Zeitstempel nicht nachträglich überschreiben können.
-- =============================================================================

alter table organizations
  add column acts_as_business boolean not null default true,
  add column terms_accepted_at timestamptz;
