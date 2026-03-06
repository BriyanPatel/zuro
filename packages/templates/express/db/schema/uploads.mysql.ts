import { datetime, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const uploads = mysqlTable("uploads", {
    id: varchar("id", { length: 255 }).primaryKey(),
    storageKey: varchar("storage_key", { length: 1024 }).notNull().unique(),
    provider: varchar("provider", { length: 32 }).notNull(),
    access: varchar("access", { length: 32 }).notNull(),
    originalName: varchar("original_name", { length: 512 }).notNull(),
    mimeType: varchar("mime_type", { length: 255 }).notNull(),
    bytes: int("bytes").notNull(),
    ownerId: varchar("owner_id", { length: 255 }),
    providerAssetId: varchar("provider_asset_id", { length: 512 }),
    resourceType: varchar("resource_type", { length: 64 }),
    createdAt: datetime("created_at", { mode: "date" }).notNull(),
});
