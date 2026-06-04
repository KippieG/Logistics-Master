import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://yardexx:yardexx_dev@localhost:5433/yardexx_db",
  },
});
