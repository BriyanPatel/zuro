import { mysqlTable, serial, timestamp } from "drizzle-orm/mysql-core";
export const example = mysqlTable("example", {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at").defaultNow(),
});
