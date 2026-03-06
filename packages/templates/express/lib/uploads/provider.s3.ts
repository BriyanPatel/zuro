import {
    AbortMultipartUploadCommand,
    CompleteMultipartUploadCommand,
    CreateMultipartUploadCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
    UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../env";
import type {
    CompletedUploadPart,
    MultipartUploadPlan,
    PreparedDirectUpload,
    UploadAccess,
    UploadDescriptor,
    UploadProvider,
} from "./types";

interface UploadContext {
    key: string;
    originalName: string;
    mimeType: string;
    bytes: number;
    access: UploadAccess;
    ownerId?: string | null;
}

function getProvider(): UploadProvider {
    return env.UPLOAD_PROVIDER;
}

function getClient() {
    return new S3Client({
        region: env.UPLOAD_REGION,
        endpoint: env.UPLOAD_ENDPOINT || undefined,
        credentials: {
            accessKeyId: env.UPLOAD_ACCESS_KEY_ID,
            secretAccessKey: env.UPLOAD_SECRET_ACCESS_KEY,
        },
    });
}

function buildPublicUrl(key: string) {
    if (env.UPLOAD_PUBLIC_BASE_URL) {
        return `${env.UPLOAD_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${key}`;
    }

    if (env.UPLOAD_ENDPOINT) {
        return `${env.UPLOAD_ENDPOINT.replace(/\/+$/, "")}/${env.UPLOAD_BUCKET}/${key}`;
    }

    return `https://${env.UPLOAD_BUCKET}.s3.${env.UPLOAD_REGION}.amazonaws.com/${key}`;
}

export async function uploadProxyFile(
    input: UploadContext & { buffer: Buffer }
): Promise<UploadDescriptor> {
    const client = getClient();
    const command = new PutObjectCommand({
        Bucket: env.UPLOAD_BUCKET,
        Key: input.key,
        Body: input.buffer,
        ContentType: input.mimeType,
    });

    await client.send(command);

    return {
        key: input.key,
        provider: getProvider(),
        access: input.access,
        originalName: input.originalName,
        mimeType: input.mimeType,
        bytes: input.bytes,
        ownerId: input.ownerId,
        url: input.access === "public" ? buildPublicUrl(input.key) : null,
    };
}

export async function createDirectUploadRequest(
    input: UploadContext
): Promise<PreparedDirectUpload> {
    const client = getClient();
    const command = new PutObjectCommand({
        Bucket: env.UPLOAD_BUCKET,
        Key: input.key,
        ContentType: input.mimeType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
        expiresIn: env.UPLOAD_DIRECT_URL_TTL_SECONDS,
    });

    return {
        provider: getProvider(),
        key: input.key,
        method: "PUT",
        uploadUrl,
        expiresInSeconds: env.UPLOAD_DIRECT_URL_TTL_SECONDS,
        headers: {
            "Content-Type": input.mimeType,
        },
    };
}

export async function completeDirectUploadRequest(
    input: UploadContext & { providerResponse?: Record<string, unknown>; resourceType?: string | null }
): Promise<UploadDescriptor> {
    return {
        key: input.key,
        provider: getProvider(),
        access: input.access,
        originalName: input.originalName,
        mimeType: input.mimeType,
        bytes: input.bytes,
        ownerId: input.ownerId,
        url: input.access === "public" ? buildPublicUrl(input.key) : null,
    };
}

export async function createMultipartUploadRequest(
    input: UploadContext & { parts: number }
): Promise<MultipartUploadPlan> {
    const client = getClient();
    const partCount = Math.max(1, Math.min(input.parts, 1000));
    const createCommand = new CreateMultipartUploadCommand({
        Bucket: env.UPLOAD_BUCKET,
        Key: input.key,
        ContentType: input.mimeType,
    });
    const created = await client.send(createCommand);

    if (!created.UploadId) {
        throw new Error("Failed to start multipart upload.");
    }

    const parts = await Promise.all(
        Array.from({ length: partCount }, async (_, index) => {
            const partNumber = index + 1;
            const signedUrl = await getSignedUrl(
                client,
                new UploadPartCommand({
                    Bucket: env.UPLOAD_BUCKET,
                    Key: input.key,
                    UploadId: created.UploadId,
                    PartNumber: partNumber,
                }),
                {
                    expiresIn: env.UPLOAD_DIRECT_URL_TTL_SECONDS,
                }
            );

            return {
                partNumber,
                url: signedUrl,
            };
        })
    );

    return {
        provider: getProvider(),
        key: input.key,
        uploadId: created.UploadId,
        partSize: env.UPLOAD_MULTIPART_PART_SIZE,
        parts,
    };
}

export async function completeMultipartUpload(
    input: UploadContext & { uploadId: string; parts: CompletedUploadPart[] }
): Promise<UploadDescriptor> {
    const client = getClient();
    await client.send(
        new CompleteMultipartUploadCommand({
            Bucket: env.UPLOAD_BUCKET,
            Key: input.key,
            UploadId: input.uploadId,
            MultipartUpload: {
                Parts: input.parts.map((part) => ({
                    ETag: part.etag,
                    PartNumber: part.partNumber,
                })),
            },
        })
    );

    return {
        key: input.key,
        provider: getProvider(),
        access: input.access,
        originalName: input.originalName,
        mimeType: input.mimeType,
        bytes: input.bytes,
        ownerId: input.ownerId,
        url: input.access === "public" ? buildPublicUrl(input.key) : null,
    };
}

export async function abortMultipartUpload(input: { key: string; uploadId: string }) {
    const client = getClient();
    await client.send(
        new AbortMultipartUploadCommand({
            Bucket: env.UPLOAD_BUCKET,
            Key: input.key,
            UploadId: input.uploadId,
        })
    );
}

export async function createAccessUrlForKey(input: { key: string; access: UploadAccess; resourceType?: string | null }) {
    if (input.access === "public") {
        return buildPublicUrl(input.key);
    }

    const client = getClient();
    return getSignedUrl(
        client,
        new GetObjectCommand({
            Bucket: env.UPLOAD_BUCKET,
            Key: input.key,
        }),
        {
            expiresIn: env.UPLOAD_ACCESS_URL_TTL_SECONDS,
        }
    );
}

export async function deleteStoredUpload(input: {
    key: string;
    access: UploadAccess;
    providerAssetId?: string | null;
    resourceType?: string | null;
}) {
    const client = getClient();
    await client.send(
        new DeleteObjectCommand({
            Bucket: env.UPLOAD_BUCKET,
            Key: input.key,
        })
    );
}
