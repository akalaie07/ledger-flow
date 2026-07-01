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

const tables = await client.query(
  "select table_name from information_schema.tables where table_schema = 'public' order by table_name",
);
const enums = await client.query(
  "select typname from pg_type where typnamespace = 'public'::regnamespace and typtype = 'e'",
);
const views = await client.query(
  "select table_name from information_schema.views where table_schema = 'public'",
);
const functions = await client.query(
  "select proname from pg_proc where pronamespace = 'public'::regnamespace",
);

console.log("TABLES:", tables.rows.map((r) => r.table_name));
console.log("ENUM TYPES:", enums.rows.map((r) => r.typname));
console.log("VIEWS:", views.rows.map((r) => r.table_name));
console.log("FUNCTIONS:", functions.rows.map((r) => r.proname));

await client.end();
