"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/get-current-org";
import { createClient } from "@/lib/supabase/server";

export type LegalInfoFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  success?: boolean;
} | null;

const LegalInfoSchema = z.object({
  legal_name: z.string().min(2, "Bitte Namen/Firmierung angeben."),
  address_street: z.string().min(2, "Bitte Straße und Hausnummer angeben."),
  address_zip: z.string().min(3, "Bitte PLZ angeben."),
  address_city: z.string().min(2, "Bitte Ort angeben."),
  address_country: z.string().min(2, "Bitte Land angeben."),
  contact_email: z.string().email("Bitte gültige E-Mail-Adresse angeben."),
  vat_id: z.string().trim().optional(),
});

export async function updateOrganizationLegalInfo(
  _prevState: LegalInfoFormState,
  formData: FormData,
): Promise<LegalInfoFormState> {
  const session = await requireSession();
  const result = LegalInfoSchema.safeParse({
    legal_name: formData.get("legal_name"),
    address_street: formData.get("address_street"),
    address_zip: formData.get("address_zip"),
    address_city: formData.get("address_city"),
    address_country: formData.get("address_country"),
    contact_email: formData.get("contact_email"),
    vat_id: formData.get("vat_id") || undefined,
  });

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ ...result.data, vat_id: result.data.vat_id || null })
    .eq("id", session.organizationId);

  if (error) {
    return { error: "Angaben konnten nicht gespeichert werden: " + error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/s", "layout");
  return { success: true };
}

export async function acceptAvv(): Promise<void> {
  const session = await requireSession();
  const supabase = await createClient();
  await supabase
    .from("organizations")
    .update({ avv_accepted_at: new Date().toISOString() })
    .eq("id", session.organizationId);
  revalidatePath("/settings");
}
