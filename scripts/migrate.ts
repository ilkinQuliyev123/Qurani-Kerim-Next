/* Miqrasiyaları tətbiq edir (drizzle/ qovluğundakı SQL). İşlətmə: npm run db:migrate */
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL yoxdur");
  if (/@(localhost|127\.0\.0\.1)(:|\/)/.test(url)) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const pool = new Pool({ connectionString: url, max: 1 });
    await migrate(drizzle(pool), { migrationsFolder: "drizzle" });
    await pool.end();
  } else {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const { migrate } = await import("drizzle-orm/neon-http/migrator");
    await migrate(drizzle(neon(url)), { migrationsFolder: "drizzle" });
  }
  console.log("miqrasiya tətbiq olundu");
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
