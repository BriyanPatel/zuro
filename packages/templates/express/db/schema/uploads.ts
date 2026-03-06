import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const uploads = pgTable("uploads", {
    id: text("id").primaryKey(),
    storageKey: text("storage_key").notNull().unique(),
    provider: text("provider").notNull(),
    access: text("access").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    bytes: integer("bytes").notNull(),
    ownerId: text("owner_id"),
    providerAssetId: text("provider_asset_id"),
    resourceType: text("resource_type"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
