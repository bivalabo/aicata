import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI は .env.local を読まないため、明示的にロード
dotenv.config({ path: path.join(__dirname, ".env.local") });

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    // Direct connection (port 5432) — used for both runtime and migrations
    url: process.env.DATABASE_URL!,
  },
});
