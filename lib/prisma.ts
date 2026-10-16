import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Box 阻 5432：用 Neon driver adapter（SQL over WebSocket/HTTP），唔使 TCP
let client: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  client = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });
  return client;
}

export const prisma = new Proxy({}, { get: (_t, prop) => getPrisma()[prop as keyof PrismaClient] }) as PrismaClient;
