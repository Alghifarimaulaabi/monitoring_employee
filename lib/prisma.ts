import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const rawConnectionString =
  process.env.DIRECT_URL || process.env.DATABASE_URL || "";

const parsedUrl = new URL(rawConnectionString);
parsedUrl.searchParams.delete("sslmode");

const pool = new Pool({
  connectionString: parsedUrl.toString(),
  ssl: {
    rejectUnauthorized: false,
  },
  keepAlive: true,
  max: 10,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 60000,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
