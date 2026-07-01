import Stripe from "stripe";
import { config } from "dotenv";

config({ path: ".env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const balance = await stripe.balance.retrieve();
console.log("Secret Key gültig. Account-Währung:", balance.available[0]?.currency ?? "(keine Balance)");

const url = stripe.oauth.authorizeUrl({
  response_type: "code",
  client_id: process.env.STRIPE_CONNECT_CLIENT_ID,
  scope: "read_write",
  redirect_uri: "http://localhost:3000/api/stripe/connect/callback",
  state: "test123",
});
console.log("OAuth-URL sieht so aus:", url);
