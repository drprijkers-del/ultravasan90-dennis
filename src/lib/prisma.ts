import pg from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type Client = InstanceType<typeof PrismaClient>;

const globalForPrisma = globalThis as unknown as {
  _prisma: Client | undefined;
};

function createPrismaClient(): Client {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = new pg.Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

/** Lazy-initialized Prisma client — only connects when first accessed */
export function getPrisma(): Client {
  if (!globalForPrisma._prisma) {
    globalForPrisma._prisma = createPrismaClient();
  }
  return globalForPrisma._prisma;
}

// For convenience in non-mock code paths
export const prisma = new Proxy({} as Client, {
  get(_target, prop) {
    return (getPrisma() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
