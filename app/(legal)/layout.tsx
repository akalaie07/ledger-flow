import Link from "next/link";

import { Wordmark } from "@/components/brand";
import { PublicFooter } from "@/components/public-footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <Link href="/">
            <Wordmark />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10">
        {/* Entwurf-Hinweis — entfernen, sobald der Anwalt die Inhalte finalisiert hat */}
        <div className="mb-8 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
          <strong>Entwurf / Platzhalter.</strong> Diese Seite ist ein Gerüst und ersetzt keine Rechtsberatung. Inhalte
          müssen von einer Anwältin/einem Anwalt geprüft und finalisiert werden.
        </div>
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}
