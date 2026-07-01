import "server-only";
import Stripe from "stripe";

// Lazy statt Modul-Top-Level — Stripe wirft sofort beim Konstruieren, wenn
// kein Key gesetzt ist, und das würde schon beim Next.js-Build (Sammeln der
// Routen-Metadaten) crashen, solange STRIPE_SECRET_KEY noch leer ist.
let instance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!instance) {
    instance = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
  }
  return instance;
}
