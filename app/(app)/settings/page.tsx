import type { Metadata } from "next";

import { requireSession } from "@/lib/auth/get-current-org";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge, Dot } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { CopyLink } from "../products/_components/copy-link";
import { isSellReady } from "@/lib/legal/sell-readiness";
import { LegalInfoForm } from "./_components/legal-info-form";
import { AvvAcceptButton } from "./_components/avv-accept-button";

export const metadata: Metadata = { title: "Einstellungen — Kalaie Ledger" };

const ERROR_MESSAGES: Record<string, string> = {
  state_mismatch: "Verbindung abgebrochen (Sicherheitsprüfung fehlgeschlagen). Bitte erneut versuchen.",
  no_profile: "Profil nicht gefunden. Bitte erneut anmelden.",
  token_exchange_failed: "Stripe konnte nicht verbunden werden. Bitte erneut versuchen.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ stripe_connected?: string; stripe_error?: string }>;
}) {
  const session = await requireSession();
  const { stripe_connected, stripe_error } = await searchParams;

  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select(
      "name, slug, stripe_account_id, stripe_connected_at, legal_name, address_street, address_zip, address_city, address_country, contact_email, vat_id, avv_accepted_at",
    )
    .eq("id", session.organizationId)
    .single();

  const isConnected = !!org?.stripe_account_id;
  const hasLegalInfo = !!(org?.legal_name && org?.address_street && org?.address_zip && org?.address_city && org?.contact_email);
  const sellReady = !!org && isSellReady(org);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-1">
        <h1 className="font-display text-3xl tracking-tight text-foreground">Einstellungen</h1>
        <p className="text-sm text-muted-foreground">Verwalte die Anbindung deiner Organisation.</p>
      </header>

      {!sellReady && (
        <div className="rounded-lg border border-warning/30 bg-warning-soft px-3.5 py-2.5 text-sm text-warning">
          <strong>Verkauf noch nicht aktiv.</strong> Solange Stripe nicht verbunden ist oder die Pflichtangaben bzw.
          der AVV fehlen, sind auf deiner Storefront keine Kaufbuttons sichtbar. Vervollständige die Punkte unten.
        </div>
      )}

      {stripe_connected && (
        <div className="rounded-lg border border-success/25 bg-success-soft px-3.5 py-2.5 text-sm text-success">
          Stripe-Konto erfolgreich verbunden.
        </div>
      )}
      {stripe_error && (
        <div role="alert" className="rounded-lg border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {ERROR_MESSAGES[stripe_error] ?? "Stripe-Verbindung fehlgeschlagen."}
        </div>
      )}

      {/* Stripe card */}
      <Card className="overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-border p-6">
          <div className="flex items-center gap-3.5">
            <span className="grid size-11 place-items-center rounded-xl bg-[#635bff]/10">
              <svg viewBox="0 0 24 24" className="size-5 fill-[#635bff]" aria-hidden>
                <path d="M13.5 9.5c0-.7.6-1 1.5-1 1.3 0 3 .4 4.3 1.1V5.4A11.4 11.4 0 0 0 15 4.7c-3.5 0-5.8 1.8-5.8 4.9 0 4.8 6.6 4 6.6 6 0 .8-.7 1.1-1.7 1.1-1.4 0-3.3-.6-4.7-1.4v4.3c1.6.7 3.2 1 4.7 1 3.6 0 6-1.8 6-4.9 0-5.1-6.6-4.2-6.6-6.1Z" />
              </svg>
            </span>
            <div>
              <h2 className="font-display text-lg tracking-tight text-foreground">Stripe</h2>
              <p className="text-sm text-muted-foreground">Zahlungen laufen direkt über dein verbundenes Konto.</p>
            </div>
          </div>
          {isConnected ? (
            <Badge tone="success">
              <Dot tone="success" /> Verbunden
            </Badge>
          ) : (
            <Badge tone="warning">
              <Dot tone="warning" /> Nicht verbunden
            </Badge>
          )}
        </div>

        <div className="p-6">
          {isConnected ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <dl className="space-y-1 text-sm">
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Konto-ID</dt>
                  <dd className="font-mono text-xs text-foreground">{org!.stripe_account_id}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Verbunden am</dt>
                  <dd className="text-foreground">{new Date(org!.stripe_connected_at!).toLocaleDateString("de-DE")}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ohne verbundenes Stripe-Konto können keine Käufe abgewickelt werden. Die Verbindung dauert weniger als eine Minute.
              </p>
              <a href="/api/stripe/connect/start" className={buttonClass("primary")}>
                Mit Stripe verbinden
              </a>
            </div>
          )}
        </div>
      </Card>

      {/* Storefront */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-6">
          <div>
            <h2 className="font-display text-lg tracking-tight text-foreground">Schaufenster</h2>
            <p className="text-sm text-muted-foreground">Deine öffentliche Produktseite — teile diesen Link mit Kunden.</p>
          </div>
          {org?.slug && <CopyLink path={`/s/${org.slug}`} />}
        </div>
        <div className="flex items-center justify-between gap-3 p-6">
          <code className="truncate font-mono text-xs text-muted-foreground">/s/{org?.slug}</code>
          {org?.slug && (
            <a href={`/s/${org.slug}`} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm font-medium text-primary hover:underline">
              Öffnen ↗
            </a>
          )}
        </div>
      </Card>

      {/* Pflichtangaben (Impressum/Widerruf auf der Storefront) */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-6">
          <div>
            <h2 className="font-display text-lg tracking-tight text-foreground">Pflichtangaben</h2>
            <p className="text-sm text-muted-foreground">
              Als Verkäuferin auf deiner Storefront bist du impressumspflichtig. Diese Angaben werden dort automatisch angezeigt.
            </p>
          </div>
          {hasLegalInfo ? (
            <Badge tone="success">
              <Dot tone="success" /> Vollständig
            </Badge>
          ) : (
            <Badge tone="warning">
              <Dot tone="warning" /> Unvollständig
            </Badge>
          )}
        </div>
        <div className="p-6">
          <LegalInfoForm
            org={{
              legal_name: org?.legal_name ?? null,
              address_street: org?.address_street ?? null,
              address_zip: org?.address_zip ?? null,
              address_city: org?.address_city ?? null,
              address_country: org?.address_country ?? "DE",
              contact_email: org?.contact_email ?? null,
              vat_id: org?.vat_id ?? null,
            }}
          />
        </div>
      </Card>

      {/* Auftragsverarbeitung */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-6">
          <div>
            <h2 className="font-display text-lg tracking-tight text-foreground">Auftragsverarbeitung</h2>
            <p className="text-sm text-muted-foreground">
              Kalaie Ledger verarbeitet die Daten deiner Kundinnen und Kunden in deinem Auftrag (Art. 28 DSGVO).
            </p>
          </div>
          {org?.avv_accepted_at ? (
            <Badge tone="success">
              <Dot tone="success" /> Angenommen am {new Date(org.avv_accepted_at).toLocaleDateString("de-DE")}
            </Badge>
          ) : (
            <Badge tone="warning">
              <Dot tone="warning" /> Noch nicht angenommen
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <a href="/avv" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
            AVV lesen ↗
          </a>
          {!org?.avv_accepted_at && <AvvAcceptButton />}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg tracking-tight text-foreground">Organisation</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between border-b border-border pb-2">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-foreground">{org?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Angemeldet als</dt>
            <dd className="text-foreground">{session.email}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
