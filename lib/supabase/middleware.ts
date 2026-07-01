import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import "@/lib/supabase/validate-env";
import type { Database } from "@/lib/types/database";

// /buy/* (Kaufseiten), /s/* (Schaufenster) und /checkout/* (Erfolg/Abbruch
// nach Stripe) sind für Kunden ohne Login erreichbar — die kaufen ja gerade
// erst etwas.
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/buy",
  "/checkout",
  "/s",
  "/impressum",
  "/datenschutz",
  "/agb",
  "/widerruf",
  "/avv",
];

const AUTH_ONLY_PATHS = ["/login", "/signup"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthOnly(pathname: string) {
  return AUTH_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // auth.getUser() anstoßen, damit die Session erneuert wird, bevor eine
  // Server-Component sie liest. Ohne diesen Aufruf läuft der Access-Token ab.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthOnly(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
