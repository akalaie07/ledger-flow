"use client";

import { useTransition } from "react";

import { acceptAvv } from "@/lib/actions/organization-legal";
import { Button } from "@/components/ui/button";

export function AvvAcceptButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button type="button" disabled={pending} onClick={() => startTransition(() => acceptAvv())}>
      {pending ? "Wird bestätigt…" : "AVV annehmen"}
    </Button>
  );
}
