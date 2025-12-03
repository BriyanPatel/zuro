import { defineConfig } from "drizzle-kit";
import { env } from "../../env";

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "mysql",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
});
