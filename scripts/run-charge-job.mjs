// Stößt den Raten-Abbuchungs-Job lokal an (sonst täglich per Vercel Cron).
import { config } from "dotenv";
config({ path: ".env.local" });

const secret = process.env.CRON_SECRET;
const res = await fetch(`http://localhost:3000/api/cron/charge-installments?secret=${encodeURIComponent(secret)}`);
console.log("HTTP", res.status);
console.log(JSON.stringify(await res.json(), null, 2));
