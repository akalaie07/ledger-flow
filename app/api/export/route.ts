import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// Datenexport der eigenen Organisation als CSV (Deals inkl. Status). Erfüllt die
// in AGB/AVV zugesagte Exportmöglichkeit. Nur für eingeloggte Nutzer; RLS
// beschränkt die Zeilen automatisch auf die eigene Organisation.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [{ data: deals }, { data: nameRows }] = await Promise.all([
    supabase
      .from("deals_with_status")
      .select("id, created_at, total_price, paid_sum, open_sum, computed_status, payment_type, customer_id, product_id")
      .order("created_at", { ascending: false }),
    supabase.from("deals").select("id, customers(name, email), products(name)"),
  ]);

  const names = new Map(
    (nameRows ?? []).map((r) => {
      const customer = Array.isArray(r.customers) ? r.customers[0] : r.customers;
      const product = Array.isArray(r.products) ? r.products[0] : r.products;
      return [r.id, { name: customer?.name ?? "", email: customer?.email ?? "", product: product?.name ?? "" }];
    }),
  );

  const header = ["Datum", "Kunde", "E-Mail", "Produkt", "Gesamtpreis", "Bezahlt", "Offen", "Status", "Zahlungsart"];

  const esc = (value: string | number | null | undefined) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  const lines = (deals ?? []).map((d) => {
    const n = names.get(d.id) ?? { name: "", email: "", product: "" };
    return [
      d.created_at?.slice(0, 10) ?? "",
      n.name,
      n.email,
      n.product,
      Number(d.total_price ?? 0).toFixed(2),
      Number(d.paid_sum ?? 0).toFixed(2),
      Number(d.open_sum ?? 0).toFixed(2),
      d.computed_status ?? "",
      d.payment_type ?? "",
    ]
      .map(esc)
      .join(";");
  });

  // BOM voran, damit Excel die Umlaute korrekt als UTF-8 liest.
  const csv = "﻿" + [header.map(esc).join(";"), ...lines].join("\r\n");
  const filename = `kalaie-ledger-export-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
