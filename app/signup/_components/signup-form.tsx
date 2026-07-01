"use client";

import { useActionState } from "react";

import { signUp, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function SignupForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signUp, null);

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <div role="alert" className="rounded-lg border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </div>
      )}

      <Field label="Dein Name" htmlFor="full_name" error={state?.fieldErrors?.full_name?.[0]}>
        <Input id="full_name" name="full_name" autoComplete="name" required placeholder="Amir Kalaie" />
      </Field>

      <Field label="Name der Organisation" htmlFor="organization_name" error={state?.fieldErrors?.organization_name?.[0]}>
        <Input id="organization_name" name="organization_name" required placeholder="z. B. Maestro Coaching" />
      </Field>

      <Field label="E-Mail" htmlFor="email" error={state?.fieldErrors?.email?.[0]}>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="du@beispiel.de" />
      </Field>

      <Field label="Passwort" htmlFor="password" hint="min. 8 Zeichen, 1 Zahl" error={state?.fieldErrors?.password?.[0]}>
        <Input id="password" name="password" type="password" autoComplete="new-password" required placeholder="••••••••" />
      </Field>

      <div className="space-y-1.5">
        <label htmlFor="accept_terms" className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
          <input
            id="accept_terms"
            name="accept_terms"
            type="checkbox"
            required
            className="mt-0.5 size-4 shrink-0 rounded border-border-strong accent-primary"
          />
          <span>
            Ich bestätige, dass ich als Unternehmer (§ 14 BGB) handle, und akzeptiere die{" "}
            <a href="/agb" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-foreground">AGB</a>{" "}
            und die{" "}
            <a href="/datenschutz" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-foreground">Datenschutzerklärung</a>.
          </span>
        </label>
        {state?.fieldErrors?.accept_terms?.[0] && (
          <p className="text-sm text-danger">{state.fieldErrors.accept_terms[0]}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Konto wird erstellt…" : "Organisation erstellen"}
      </Button>
    </form>
  );
}
