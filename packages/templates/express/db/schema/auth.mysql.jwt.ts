import { mysqlTable, varchar, datetime, uniqueIndex } from "drizzle-orm/mysql-core";

export const user = mysqlTable("user", {
    id: varchar("id", { length: 255 }).primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    name: varchar("name", { length: 255 }),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    createdAt: datetime("created_at", { mode: "date" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "date" }).notNull(),
}, (table) => ({
    userEmailUnique: uniqueIndex("user_email_unique").on(table.email),
}));

export const refreshToken = mysqlTable("refresh_token", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    expiresAt: datetime("expires_at", { mode: "date" }).notNull(),
    revokedAt: datetime("revoked_at", { mode: "date" }),
    createdAt: datetime("created_at", { mode: "date" }).notNull(),
}, (table) => ({
    refreshTokenHashUnique: uniqueIndex("refresh_token_hash_unique").on(table.tokenHash),
}));
