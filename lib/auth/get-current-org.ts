import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type CurrentSession = {
  userId: string;
  email: string;
  fullName: string | null;
  organizationId: string;
  organizationName: string;
};

export const getCurrentSession = cache(async (): Promise<CurrentSession | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, organization_id, organizations(name)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.organization_id) return null;

  return {
    userId: user.id,
    email: profile.email,
    fullName: profile.full_name ?? null,
    organizationId: profile.organization_id,
    organizationName: profile.organizations?.name ?? "",
  };
});

export async function requireSession(): Promise<CurrentSession> {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  return session;
}
