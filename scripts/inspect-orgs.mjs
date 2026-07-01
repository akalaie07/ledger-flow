import { Client } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectRef = new URL(url).hostname.split(".")[0];

const client = new Client({
  host: `db.${projectRef}.supabase.co`,
  port: 5432,
  user: "postgres",
  password: process.env.SUPABASE_DB_PASSWORD,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();
const orgs = await client.query("select id, name, slug, stripe_account_id, created_at from organizations order by created_at");
console.table(orgs.rows);
await client.end();
