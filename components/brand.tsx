import { cn } from "@/lib/utils";

/** Ledger mark: stacked rules with a rising tick — "books that grow". */
export function LedgerMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("size-5", className)} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" className="stroke-primary" strokeWidth="1.6" />
      <path d="M7 14.5 10 11l2.2 2.2L17 8.5" className="stroke-primary" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.2 8.5H17V11.3" className="stroke-primary" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ className, sub }: { className?: string; sub?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="grid size-9 place-items-center rounded-lg bg-primary-soft">
        <LedgerMark />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-medium tracking-tight text-foreground">Kalaie Ledger</span>
        {sub && <span className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-faint">{sub}</span>}
      </span>
    </span>
  );
}
