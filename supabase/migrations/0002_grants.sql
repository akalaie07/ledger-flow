-- =============================================================================
-- Default-Grants nachziehen
--
-- "Automatically expose new tables" ist im Projekt bewusst deaktiviert (siehe
-- Sicherheits-Einstellungen bei Projekt-Anlage). Das verhindert aber nicht nur
-- automatische Grants für `anon`, sondern auch für `service_role` und
-- `authenticated` — RLS-Policies allein reichen nicht, die Rollen brauchen
-- zusätzlich GRANT auf SQL-Ebene, bevor RLS überhaupt greift.
-- =============================================================================

grant usage on schema public to service_role, authenticated, anon;

-- service_role: volle Rechte (Webhook-Handler, Admin-Skripte — umgeht RLS sowieso)
grant all on all tables in schema public to service_role;

-- authenticated: Grundrechte, RLS-Policies bestimmen welche Zeilen sichtbar sind
grant select on organizations, profiles, customers, deals, installments to authenticated;
grant select, insert, update, delete on products to authenticated;
grant select on deal_balance, deals_with_status to authenticated;
