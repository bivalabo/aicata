import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI は .env.local を読まないため、明示的にロード
dotenv.config({ path: path.join(__dirname, ".env.local") });

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    // Transaction pooler (port 6543) — for serverless/Vercel
    url: process.env.DATABASE_URL!,
    // Direct connection (port 5432) — for migrations
    directUrl: process.env.DIRECT_URL,
  },
});
