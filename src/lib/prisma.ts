import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Next dev'de hot-reload yüzünden yeni connection açmasın diye global cache
const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString,
    // Supabase genelde SSL ister; pooler ile çoğu durumda bu lazım:
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.pgPool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
