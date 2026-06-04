import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString =
    process.env.DATABASE_URL ?? "postgresql://yardexx:yardexx_dev@localhost:5433/yardexx_db";

  // Supabase/cloud requires SSL but self-signed cert chain — disable verification
  const ssl = connectionString.includes("supabase") || connectionString.includes("neon")
    ? { rejectUnauthorized: false }
    : undefined;

  const adapter = new PrismaPg({ connectionString, ssl });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
