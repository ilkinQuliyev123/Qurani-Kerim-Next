import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL təyin olunmayıb (.env.local və ya Vercel mühit dəyişəni).");

/** Neon (HTTP, serverless üçün ən yaxşısı) — yerli/digər Postgres üçün node-postgres (test və inkişaf). */
const isLocal = /@(localhost|127\.0\.0\.1)(:|\/)/.test(url);

function create() {
  if (!isLocal) return drizzleNeon(neon(url!), { schema });
  const g = globalThis as unknown as { __pgPool?: Pool };
  g.__pgPool ??= new Pool({ connectionString: url, max: 1 });
  // Tiplər neon-http ilə eynidir (eyni sorğu API-si); yalnız yerli test üçün.
  return drizzlePg(g.__pgPool, { schema }) as unknown as ReturnType<typeof drizzleNeon<typeof schema>>;
}

export const db = create();
export { schema };
