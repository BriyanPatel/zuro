// Example schema
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
export const example = pgTable("example", {
    id: text("id").primaryKey(),
    createdAt: timestamp("created_at").defaultNow(),
});
