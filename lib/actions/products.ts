"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireSession } from "@/lib/auth/get-current-org";
import { createClient } from "@/lib/supabase/server";

export type ProductFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
} | null;

const ProductSchema = z
  .object({
    name: z.string().min(2, "Name zu kurz."),
    description: z.string().trim().optional(),
    price_amount: z.coerce.number().min(0, "Preis darf nicht negativ sein."),
    payment_type: z.enum(["one_time", "installments"]),
    down_payment: z.coerce.number().min(0).optional(),
    installment_count: z.coerce.number().int().min(1).optional(),
    installment_interval_days: z.coerce.number().int().min(1).optional(),
  })
  .refine(
    (data) =>
      data.payment_type !== "installments" ||
      (data.down_payment !== undefined &&
        data.installment_count !== undefined &&
        data.installment_interval_days !== undefined),
    {
      message: "Bei Ratenzahlung müssen Anzahlung, Anzahl Raten und Intervall (Tage) gesetzt sein.",
      path: ["down_payment"],
    },
  );

function parseProductForm(formData: FormData) {
  return ProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price_amount: formData.get("price_amount"),
    payment_type: formData.get("payment_type"),
    down_payment: formData.get("down_payment") || undefined,
    installment_count: formData.get("installment_count") || undefined,
    installment_interval_days: formData.get("installment_interval_days") || undefined,
  });
}

export async function createProduct(_prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const session = await requireSession();
  const result = parseProductForm(formData);
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    organization_id: session.organizationId,
    ...result.data,
  });

  if (error) {
    return { error: "Produkt konnte nicht angelegt werden: " + error.message };
  }

  revalidatePath("/products");
  redirect("/products");
}

export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireSession();
  const result = parseProductForm(formData);
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").update(result.data).eq("id", productId);

  if (error) {
    return { error: "Produkt konnte nicht gespeichert werden: " + error.message };
  }

  revalidatePath("/products");
  redirect("/products");
}

export async function toggleProductActive(productId: string, active: boolean): Promise<void> {
  await requireSession();
  const supabase = await createClient();
  await supabase.from("products").update({ active }).eq("id", productId);
  revalidatePath("/products");
}
