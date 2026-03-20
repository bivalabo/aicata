import path from "node:path";
import { defineConfig } from "prisma/config";

const DB_URL = process.env.DATABASE_URL || "file:./prisma/data/aicata.db";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: DB_URL,
  },
});
