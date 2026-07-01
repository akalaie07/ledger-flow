"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export function CopyLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Checkout-Link kopieren:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors",
        copied ? "border-success/30 bg-success-soft text-success" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
      )}
      aria-label="Checkout-Link kopieren"
    >
      {copied ? (
        <>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="size-3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 5 5L20 6" />
          </svg>
          Kopiert
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" className="size-3.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
          Checkout-Link
        </>
      )}
    </button>
  );
}
