import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const settingsUrl = new URL("/settings", request.url);
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get("stripe_connect_state")?.value;

  if (!code || !state || state !== expectedState) {
    settingsUrl.searchParams.set("stripe_error", "state_mismatch");
    return NextResponse.redirect(settingsUrl);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("organization_id").eq("id", user.id).single();
  if (!profile) {
    settingsUrl.searchParams.set("stripe_error", "no_profile");
    return NextResponse.redirect(settingsUrl);
  }

  try {
    const token = await getStripe().oauth.token({ grant_type: "authorization_code", code });

    await admin
      .from("organizations")
      .update({
        stripe_account_id: token.stripe_user_id,
        stripe_connected_at: new Date().toISOString(),
      })
      .eq("id", profile.organization_id);

    settingsUrl.searchParams.set("stripe_connected", "1");
  } catch {
    settingsUrl.searchParams.set("stripe_error", "token_exchange_failed");
  }

  const response = NextResponse.redirect(settingsUrl);
  response.cookies.delete("stripe_connect_state");
  return response;
}
