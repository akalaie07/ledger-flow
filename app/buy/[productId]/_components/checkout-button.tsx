"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function CheckoutButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        "Weiterleitung zu Stripe…"
      ) : (
        <>
          {label}
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="size-4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </>
      )}
    </Button>
  );
}
