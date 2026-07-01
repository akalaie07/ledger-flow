import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const state = randomBytes(16).toString("hex");
  const authorizeUrl = getStripe().oauth.authorizeUrl({
    response_type: "code",
    client_id: process.env.STRIPE_CONNECT_CLIENT_ID,
    scope: "read_write",
    redirect_uri: new URL("/api/stripe/connect/callback", request.url).toString(),
    state,
  });

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("stripe_connect_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return response;
}
