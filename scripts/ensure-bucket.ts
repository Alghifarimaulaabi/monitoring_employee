import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const connectionString = (process.env.DIRECT_URL || process.env.DATABASE_URL || "").replace("?sslmode=require", "");
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await pool.query(`
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('bouquet-photos', 'bouquet-photos', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
  `);

  console.log("Bucket 'bouquet-photos' successfully ensured in storage.buckets!");
  await pool.end();
}

main().catch((err) => {
  console.error("Error creating bucket:", err);
  process.exit(1);
});
