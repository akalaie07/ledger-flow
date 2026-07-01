"use client";

import { useActionState } from "react";

import { updateOrganizationLegalInfo, type LegalInfoFormState } from "@/lib/actions/organization-legal";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

type LegalInfo = {
  legal_name: string | null;
  address_street: string | null;
  address_zip: string | null;
  address_city: string | null;
  address_country: string;
  contact_email: string | null;
  vat_id: string | null;
};

export function LegalInfoForm({ org }: { org: LegalInfo }) {
  const [state, formAction, pending] = useActionState<LegalInfoFormState, FormData>(updateOrganizationLegalInfo, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div role="alert" className="rounded-lg border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg border border-success/25 bg-success-soft px-3.5 py-2.5 text-sm text-success">
          Angaben gespeichert.
        </div>
      )}

      <Field label="Name / Firmierung" htmlFor="legal_name" hint="wie im Handelsregister bzw. dein voller Name" error={state?.fieldErrors?.legal_name?.[0]}>
        <Input id="legal_name" name="legal_name" required defaultValue={org.legal_name ?? ""} placeholder="Maestro Coaching GmbH" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
        <Field label="Straße und Hausnummer" htmlFor="address_street" error={state?.fieldErrors?.address_street?.[0]}>
          <Input id="address_street" name="address_street" required defaultValue={org.address_street ?? ""} placeholder="Musterstraße 1" />
        </Field>
        <Field label="PLZ" htmlFor="address_zip" error={state?.fieldErrors?.address_zip?.[0]}>
          <Input id="address_zip" name="address_zip" required defaultValue={org.address_zip ?? ""} className="w-28" placeholder="10243" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ort" htmlFor="address_city" error={state?.fieldErrors?.address_city?.[0]}>
          <Input id="address_city" name="address_city" required defaultValue={org.address_city ?? ""} placeholder="Berlin" />
        </Field>
        <Field label="Land" htmlFor="address_country" error={state?.fieldErrors?.address_country?.[0]}>
          <Input id="address_country" name="address_country" required defaultValue={org.address_country ?? "DE"} placeholder="DE" />
        </Field>
      </div>

      <Field label="Kontakt-E-Mail" htmlFor="contact_email" hint="wird im Impressum deiner Storefront angezeigt" error={state?.fieldErrors?.contact_email?.[0]}>
        <Input id="contact_email" name="contact_email" type="email" required defaultValue={org.contact_email ?? ""} placeholder="kontakt@deinefirma.de" />
      </Field>

      <Field label="USt-IdNr." htmlFor="vat_id" hint="optional, falls vorhanden">
        <Input id="vat_id" name="vat_id" defaultValue={org.vat_id ?? ""} placeholder="DE123456789" />
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Speichern…" : "Angaben speichern"}
        </Button>
      </div>
    </form>
  );
}
