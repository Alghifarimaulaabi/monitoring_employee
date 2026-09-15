import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const rawConnectionString =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  "postgresql://postgres:postgres@localhost:5432/postgres";

let connectionString = rawConnectionString;
try {
  const parsedUrl = new URL(rawConnectionString);
  parsedUrl.searchParams.delete("sslmode");
  connectionString = parsedUrl.toString();
} catch {
  // Safe fallback if URL parsing fails
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  keepAlive: true,
  max: process.env.NODE_ENV === "production" ? 1 : 10,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 20000,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
