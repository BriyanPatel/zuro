import type { Request } from "express";
import { randomUUID } from "node:crypto";
import { env } from "../../env";
import {
    abortMultipartUpload,
    completeDirectUploadRequest,
    completeMultipartUpload,
    createAccessUrlForKey,
    createDirectUploadRequest,
    createMultipartUploadRequest,
    deleteStoredUpload,
    uploadProxyFile,
} from "./provider";
import {
    deleteUploadRecordByKey,
    getUploadRecordByKey,
    saveUploadRecord,
} from "./metadata";
import type {
    CompletedUploadPart,
    MultipartUploadPlan,
    PreparedDirectUpload,
    UploadAccess,
    UploadAuthMode,
    UploadDescriptor,
    UploadMode,
    UploadPreset,
    UploadProvider,
    UploadRecord,
} from "./types";

export interface UploadActor {
    ownerId?: string | null;
}

export interface DirectUploadInput extends UploadActor {
    originalName: string;
    mimeType: string;
    bytes: number;
}

export interface DirectUploadCompletion extends UploadActor {
    key: string;
    originalName: string;
    mimeType: string;
    bytes: number;
    providerResponse?: Record<string, unknown>;
    resourceType?: string | null;
}

export interface MultipartUploadInput extends UploadActor {
    originalName: string;
    mimeType: string;
    bytes: number;
    parts: number;
}

export interface MultipartUploadCompletion extends UploadActor {
    key: string;
    uploadId: string;
    parts: CompletedUploadPart[];
    originalName: string;
    mimeType: string;
    bytes: number;
}

export interface UploadAccessInput extends UploadActor {
    key: string;
    resourceType?: string | null;
}

export interface DeleteUploadInput extends UploadAccessInput {
    providerAssetId?: string | null;
}

const allowedMimeTypes = env.UPLOAD_ALLOWED_MIME
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

function normalizeFilename(value: string) {
    const normalized = value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^[.-]+|[.-]+$/g, "");

    return normalized || "upload.bin";
}

function buildDatePrefix() {
    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");

    return `${year}/${month}/${day}`;
}

function getKeyPrefix() {
    return env.UPLOAD_KEY_PREFIX.replace(/^\/+|\/+$/g, "") || "uploads";
}

export function getUploadProvider(): UploadProvider {
    return env.UPLOAD_PROVIDER;
}

export function getUploadMode(): UploadMode {
    return env.UPLOAD_MODE;
}

export function getUploadPreset(): UploadPreset {
    return env.UPLOAD_FILE_PRESET;
}

export function getUploadAuthMode(): UploadAuthMode {
    return env.UPLOAD_AUTH_MODE;
}

export function getUploadAccess(): UploadAccess {
    return env.UPLOAD_FILE_ACCESS;
}

export function isPrivateUpload() {
    return getUploadAccess() === "private";
}

export function createUploadKey(originalName: string, ownerId?: string | null) {
    const cleanName = normalizeFilename(originalName);
    const actorSegment = ownerId ? `users/${ownerId}` : "public";

    return `${getKeyPrefix()}/${actorSegment}/${buildDatePrefix()}/${randomUUID()}-${cleanName}`;
}

export function assertConfiguredMode(expectedMode: UploadMode) {
    if (getUploadMode() !== expectedMode) {
        throw new Error(`Uploads module is configured for ${getUploadMode()} mode, not ${expectedMode}.`);
    }
}

export function assertAllowedMimeType(mimeType: string) {
    if (!mimeType || allowedMimeTypes.length === 0) {
        return;
    }

    if (!allowedMimeTypes.includes(mimeType)) {
        throw new Error(`File type '${mimeType}' is not allowed for the ${getUploadPreset()} preset.`);
    }
}

export function assertUploadActorAllowed(ownerId?: string | null) {
    if (getUploadAuthMode() === "required" && !ownerId) {
        throw new Error("Authentication is required for uploads.");
    }
}

function assertPrivateAccessAllowed(ownerId?: string | null) {
    if (!isPrivateUpload()) {
        return;
    }

    if (getUploadAuthMode() !== "none" && !ownerId) {
        throw new Error("Authentication is required to access private uploads.");
    }
}

function assertOwnerMatch(storageKey: string, ownerId?: string | null, record?: UploadRecord | null) {
    if (!ownerId) {
        return;
    }

    if (record?.ownerId && record.ownerId !== ownerId) {
        throw new Error("You do not have access to this upload.");
    }

    const expectedPrefix = `${getKeyPrefix()}/users/${ownerId}/`;
    if (!record?.ownerId && !storageKey.startsWith(expectedPrefix)) {
        throw new Error("You do not have access to this upload.");
    }
}

export function getUploadOwnerId(req: Request & { uploadUser?: { id: string } | null }) {
    return req.uploadUser?.id || null;
}

export async function saveProxyUpload(
    file: Express.Multer.File,
    actor: UploadActor = {}
) {
    assertConfiguredMode("proxy");
    assertUploadActorAllowed(actor.ownerId);
    assertAllowedMimeType(file.mimetype);

    const descriptor = await uploadProxyFile({
        key: createUploadKey(file.originalname, actor.ownerId),
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        bytes: file.size,
        access: getUploadAccess(),
        ownerId: actor.ownerId,
    });

    const record = await saveUploadRecord(descriptor);

    return {
        upload: descriptor,
        record,
    };
}

export async function prepareDirectUpload(input: DirectUploadInput): Promise<PreparedDirectUpload> {
    assertConfiguredMode("direct");
    assertUploadActorAllowed(input.ownerId);
    assertAllowedMimeType(input.mimeType);

    return createDirectUploadRequest({
        key: createUploadKey(input.originalName, input.ownerId),
        originalName: input.originalName,
        mimeType: input.mimeType,
        bytes: input.bytes,
        access: getUploadAccess(),
        ownerId: input.ownerId,
    });
}

export async function completeDirectUpload(
    input: DirectUploadCompletion
) {
    assertConfiguredMode("direct");
    assertUploadActorAllowed(input.ownerId);
    assertAllowedMimeType(input.mimeType);
    assertOwnerMatch(input.key, input.ownerId);

    const descriptor = await completeDirectUploadRequest({
        key: input.key,
        originalName: input.originalName,
        mimeType: input.mimeType,
        bytes: input.bytes,
        access: getUploadAccess(),
        ownerId: input.ownerId,
        providerResponse: input.providerResponse,
        resourceType: input.resourceType,
    });

    const record = await saveUploadRecord(descriptor);

    return {
        upload: descriptor,
        record,
    };
}

export async function prepareMultipartUpload(
    input: MultipartUploadInput
): Promise<MultipartUploadPlan> {
    assertConfiguredMode("large");
    assertUploadActorAllowed(input.ownerId);
    assertAllowedMimeType(input.mimeType);

    return createMultipartUploadRequest({
        key: createUploadKey(input.originalName, input.ownerId),
        originalName: input.originalName,
        mimeType: input.mimeType,
        bytes: input.bytes,
        parts: input.parts,
        access: getUploadAccess(),
        ownerId: input.ownerId,
    });
}

export async function completeMultipartUploadFlow(
    input: MultipartUploadCompletion
) {
    assertConfiguredMode("large");
    assertUploadActorAllowed(input.ownerId);
    assertAllowedMimeType(input.mimeType);
    assertOwnerMatch(input.key, input.ownerId);

    const descriptor = await completeMultipartUpload({
        key: input.key,
        uploadId: input.uploadId,
        parts: input.parts,
        originalName: input.originalName,
        mimeType: input.mimeType,
        bytes: input.bytes,
        access: getUploadAccess(),
        ownerId: input.ownerId,
    });

    const record = await saveUploadRecord(descriptor);

    return {
        upload: descriptor,
        record,
    };
}

export async function abortMultipartUploadFlow(input: UploadAccessInput & { uploadId: string }) {
    assertConfiguredMode("large");
    assertUploadActorAllowed(input.ownerId);
    assertOwnerMatch(input.key, input.ownerId);

    await abortMultipartUpload({
        key: input.key,
        uploadId: input.uploadId,
    });
}

export async function getUploadAccessUrl(input: UploadAccessInput) {
    const record = await getUploadRecordByKey(input.key);

    assertPrivateAccessAllowed(input.ownerId);
    assertOwnerMatch(input.key, input.ownerId, record);

    const url = await createAccessUrlForKey({
        key: input.key,
        access: getUploadAccess(),
        resourceType: input.resourceType || record?.resourceType,
    });

    return {
        key: input.key,
        url,
        record,
    };
}

export async function deleteUpload(input: DeleteUploadInput) {
    const record = await getUploadRecordByKey(input.key);

    assertPrivateAccessAllowed(input.ownerId);
    assertOwnerMatch(input.key, input.ownerId, record);

    await deleteStoredUpload({
        key: input.key,
        access: getUploadAccess(),
        providerAssetId: input.providerAssetId || record?.providerAssetId,
        resourceType: input.resourceType || record?.resourceType,
    });
    await deleteUploadRecordByKey(input.key);
}

export async function getUploadRecord(input: UploadAccessInput) {
    const record = await getUploadRecordByKey(input.key);

    assertPrivateAccessAllowed(input.ownerId);
    assertOwnerMatch(input.key, input.ownerId, record);

    return record;
}
