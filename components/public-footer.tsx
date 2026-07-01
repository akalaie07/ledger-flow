import Link from "next/link";

const links = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
  { href: "/widerruf", label: "Widerruf" },
  { href: "/avv", label: "AVV" },
];

/** Rechts-Footer für öffentliche Seiten (Schaufenster, Checkout, Erfolg). */
export function PublicFooter() {
  return (
    <footer className="mt-12 border-t border-border py-6">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-5 text-center">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="text-[11px] text-faint">
          Zahlungsabwicklung über Stripe. Verkäufer ist die jeweilige Organisation.
        </p>
      </div>
    </footer>
  );
}
