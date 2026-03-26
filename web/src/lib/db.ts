import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // サーバーレス環境向けにコネクションプール制限
  const adapter = new PrismaPg({
    connectionString,
    max: 2, // 最大接続数を制限
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });
  return new PrismaClient({ adapter });
}

// 本番環境でもグローバルキャッシュ（サーバーレスの接続数抑制）
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;
