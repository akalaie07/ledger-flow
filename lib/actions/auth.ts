"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
} | null;

const LoginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse.").trim().toLowerCase(),
  password: z.string().min(8, "Mindestens 8 Zeichen erforderlich."),
});

const SignupSchema = z.object({
  full_name: z.string().min(2, "Name zu kurz (min. 2 Zeichen).").trim(),
  organization_name: z.string().min(2, "Organisationsname zu kurz (min. 2 Zeichen).").trim(),
  email: z.string().email("Ungültige E-Mail-Adresse.").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Mindestens 8 Zeichen.")
    .regex(/[a-zA-Z]/, "Muss einen Buchstaben enthalten.")
    .regex(/[0-9]/, "Muss eine Zahl enthalten."),
  accept_terms: z.literal("on", {
    message: "Bitte bestätige, dass du als Unternehmer handelst und die AGB akzeptierst.",
  }),
});

export async function signIn(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const result = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(result.data);

  if (error) {
    return { error: "E-Mail oder Passwort falsch. Bitte erneut versuchen." };
  }

  redirect("/dashboard");
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "org"
  );
}

async function uniqueSlug(admin: ReturnType<typeof createAdminClient>, base: string): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const candidate = i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data } = await admin.from("organizations").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function signUp(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const result = SignupSchema.safeParse({
    full_name: formData.get("full_name"),
    organization_name: formData.get("organization_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    accept_terms: formData.get("accept_terms"),
  });

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const { full_name, organization_name, email, password } = result.data;
  const admin = createAdminClient();

  // 1) Auth-User (scheitert zuerst, wenn die E-Mail schon existiert → keine Org-Leiche)
  const { data: userResult, error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (userError || !userResult.user) {
    const msg = userError?.message.toLowerCase() ?? "";
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      return { error: "Diese E-Mail-Adresse ist bereits registriert." };
    }
    return { error: "Registrierung fehlgeschlagen. Bitte erneut versuchen." };
  }

  // 2) Organisation
  const slug = await uniqueSlug(admin, slugify(organization_name));
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({ name: organization_name, slug, acts_as_business: true, terms_accepted_at: new Date().toISOString() })
    .select("id")
    .single();
  if (orgError || !org) {
    await admin.auth.admin.deleteUser(userResult.user.id);
    return { error: "Organisation konnte nicht angelegt werden. Bitte erneut versuchen." };
  }

  // 3) Profil
  const { error: profileError } = await admin.from("profiles").insert({
    id: userResult.user.id,
    organization_id: org.id,
    email,
    full_name,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(userResult.user.id);
    await admin.from("organizations").delete().eq("id", org.id);
    return { error: "Profil konnte nicht angelegt werden. Bitte erneut versuchen." };
  }

  // 4) Direkt einloggen
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email, password });
  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
