"use client";

import { useActionState } from "react";

import { signIn, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signIn, null);

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <div
          role="alert"
          className="rounded-lg border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger"
        >
          {state.error}
        </div>
      )}

      <Field label="E-Mail" htmlFor="email" error={state?.fieldErrors?.email?.[0]}>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="du@beispiel.de" />
      </Field>

      <Field label="Passwort" htmlFor="password" error={state?.fieldErrors?.password?.[0]}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Anmelden…" : "Anmelden"}
      </Button>
    </form>
  );
}
