import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Alle Pfade außer:
     * - _next/static, _next/image (Next.js intern)
     * - favicon, Dateien mit Endung
     * - /api (Webhooks dürfen NIE auf /login umgeleitet werden)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)",
  ],
};
