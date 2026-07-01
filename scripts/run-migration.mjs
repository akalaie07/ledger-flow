// Führt eine einzelne SQL-Migrationsdatei direkt gegen die Supabase-Postgres-DB
// aus. Workaround dafür, dass `supabase link` hier ein Personal Access Token
// bräuchte (Management API), während wir nur das DB-Passwort haben — eine
// direkte Postgres-Verbindung kommt ohne PAT aus.
//
// Usage: node scripts/run-migration.mjs supabase/migrations/0001_init.sql
import { readFileSync } from "node:fs";
import { Client } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/run-migration.mjs <path-to-sql-file>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const password = process.env.SUPABASE_DB_PASSWORD;
if (!url || !password) {
  console.error("NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_DB_PASSWORD fehlt in .env.local");
  process.exit(1);
}

const projectRef = new URL(url).hostname.split(".")[0];
const sql = readFileSync(file, "utf-8");

const client = new Client({
  host: `db.${projectRef}.supabase.co`,
  port: 5432,
  user: "postgres",
  password,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log(`Verbunden mit db.${projectRef}.supabase.co — führe ${file} aus ...`);
  await client.query(sql);
  console.log("Migration erfolgreich angewendet.");
} catch (err) {
  console.error("Migration fehlgeschlagen:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
