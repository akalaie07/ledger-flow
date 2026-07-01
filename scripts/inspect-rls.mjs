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

const rls = await client.query(`
  select relname, relrowsecurity as rls_enabled, relforcerowsecurity as rls_forced
  from pg_class
  where relnamespace = 'public'::regnamespace and relkind = 'r'
  order by relname
`);
const policies = await client.query(`
  select tablename, policyname, cmd from pg_policies where schemaname = 'public' order by tablename, policyname
`);

console.table(rls.rows);
console.table(policies.rows);

await client.end();
