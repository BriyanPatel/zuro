import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { uploads } from "../../db/schema";
import type { UploadDescriptor, UploadRecord } from "./types";

export async function saveUploadRecord(descriptor: UploadDescriptor): Promise<UploadRecord> {
    const record: UploadRecord = {
        id: randomUUID(),
        storageKey: descriptor.key,
        provider: descriptor.provider,
        access: descriptor.access,
        originalName: descriptor.originalName,
        mimeType: descriptor.mimeType,
        bytes: descriptor.bytes,
        ownerId: descriptor.ownerId,
        providerAssetId: descriptor.providerAssetId,
        resourceType: descriptor.resourceType,
        createdAt: new Date(),
    };

    await db.insert(uploads).values({
        id: record.id,
        storageKey: record.storageKey,
        provider: record.provider,
        access: record.access,
        originalName: record.originalName,
        mimeType: record.mimeType,
        bytes: record.bytes,
        ownerId: record.ownerId ?? null,
        providerAssetId: record.providerAssetId ?? null,
        resourceType: record.resourceType ?? null,
        createdAt: new Date(),
    });

    return record;
}

export async function getUploadRecordByKey(storageKey: string): Promise<UploadRecord | null> {
    const rows = await db.select().from(uploads).where(eq(uploads.storageKey, storageKey)).limit(1);
    const row = rows[0];

    if (!row) {
        return null;
    }

    return {
        id: row.id,
        storageKey: row.storageKey,
        provider: row.provider,
        access: row.access,
        originalName: row.originalName,
        mimeType: row.mimeType,
        bytes: row.bytes,
        ownerId: row.ownerId,
        providerAssetId: row.providerAssetId,
        resourceType: row.resourceType,
        createdAt: row.createdAt,
    };
}

export async function deleteUploadRecordByKey(storageKey: string) {
    await db.delete(uploads).where(eq(uploads.storageKey, storageKey));
}
