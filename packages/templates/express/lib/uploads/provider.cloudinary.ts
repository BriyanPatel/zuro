import { v2 as cloudinary } from "cloudinary";
import { env } from "../../env";
import type {
    MultipartUploadPlan,
    PreparedDirectUpload,
    UploadAccess,
    UploadDescriptor,
} from "./types";

interface UploadContext {
    key: string;
    originalName: string;
    mimeType: string;
    bytes: number;
    access: UploadAccess;
    ownerId?: string | null;
}

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
});

function getDeliveryType(access: UploadAccess) {
    return access === "private" ? "authenticated" : "upload";
}

function createUploadSignature(key: string, access: UploadAccess) {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = {
        folder: env.CLOUDINARY_FOLDER,
        public_id: key,
        timestamp,
        type: getDeliveryType(access),
    };

    return {
        timestamp,
        signature: cloudinary.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET),
    };
}

function normalizeResourceType(value?: string | null) {
    if (value === "video" || value === "raw") {
        return value;
    }

    return "image";
}

function buildCloudinaryUrl(key: string, access: UploadAccess, resourceType?: string | null) {
    return cloudinary.url(key, {
        secure: true,
        resource_type: normalizeResourceType(resourceType),
        type: getDeliveryType(access),
        sign_url: access === "private",
    });
}

export async function uploadProxyFile(
    input: UploadContext & { buffer: Buffer }
): Promise<UploadDescriptor> {
    const result = await new Promise<{
        public_id: string;
        bytes: number;
        secure_url: string;
        resource_type: string;
    }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: env.CLOUDINARY_FOLDER,
                public_id: input.key,
                resource_type: "auto",
                type: getDeliveryType(input.access),
            },
            (error, uploaded) => {
                if (error || !uploaded) {
                    reject(error || new Error("Cloudinary upload failed."));
                    return;
                }

                resolve({
                    public_id: uploaded.public_id,
                    bytes: uploaded.bytes,
                    secure_url: uploaded.secure_url,
                    resource_type: uploaded.resource_type,
                });
            }
        );

        stream.end(input.buffer);
    });

    return {
        key: result.public_id,
        provider: "cloudinary",
        access: input.access,
        originalName: input.originalName,
        mimeType: input.mimeType,
        bytes: result.bytes || input.bytes,
        ownerId: input.ownerId,
        url: input.access === "public" ? result.secure_url : buildCloudinaryUrl(result.public_id, input.access, result.resource_type),
        providerAssetId: result.public_id,
        resourceType: result.resource_type,
    };
}

export async function createDirectUploadRequest(
    input: UploadContext
): Promise<PreparedDirectUpload> {
    const signed = createUploadSignature(input.key, input.access);

    return {
        provider: "cloudinary",
        key: input.key,
        method: "POST",
        uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
        expiresInSeconds: env.UPLOAD_DIRECT_URL_TTL_SECONDS,
        fields: {
            api_key: env.CLOUDINARY_API_KEY,
            folder: env.CLOUDINARY_FOLDER,
            public_id: input.key,
            signature: signed.signature,
            timestamp: String(signed.timestamp),
            type: getDeliveryType(input.access),
        },
    };
}

export async function completeDirectUploadRequest(
    input: UploadContext & { providerResponse?: Record<string, unknown>; resourceType?: string | null }
): Promise<UploadDescriptor> {
    const publicId = typeof input.providerResponse?.publicId === "string"
        ? input.providerResponse.publicId
        : input.key;
    const resourceType = typeof input.providerResponse?.resourceType === "string"
        ? input.providerResponse.resourceType
        : input.resourceType;
    const secureUrl = typeof input.providerResponse?.secureUrl === "string"
        ? input.providerResponse.secureUrl
        : null;

    return {
        key: publicId,
        provider: "cloudinary",
        access: input.access,
        originalName: input.originalName,
        mimeType: input.mimeType,
        bytes: input.bytes,
        ownerId: input.ownerId,
        url: input.access === "public"
            ? secureUrl || buildCloudinaryUrl(publicId, input.access, resourceType)
            : buildCloudinaryUrl(publicId, input.access, resourceType),
        providerAssetId: publicId,
        resourceType: resourceType || "image",
    };
}

export async function createMultipartUploadRequest(
    _input: UploadContext & { parts: number }
): Promise<MultipartUploadPlan> {
    throw new Error("Large multipart uploads are not scaffolded for Cloudinary. Use S3 or R2 instead.");
}

export async function completeMultipartUpload(
    _input: UploadContext & { uploadId: string; parts: Array<{ partNumber: number; etag: string }> }
): Promise<UploadDescriptor> {
    throw new Error("Large multipart uploads are not scaffolded for Cloudinary. Use S3 or R2 instead.");
}

export async function abortMultipartUpload(_input: { key: string; uploadId: string }) {
    throw new Error("Large multipart uploads are not scaffolded for Cloudinary. Use S3 or R2 instead.");
}

export async function createAccessUrlForKey(input: {
    key: string;
    access: UploadAccess;
    resourceType?: string | null;
}) {
    return buildCloudinaryUrl(input.key, input.access, input.resourceType);
}

export async function deleteStoredUpload(input: {
    key: string;
    access: UploadAccess;
    providerAssetId?: string | null;
    resourceType?: string | null;
}) {
    await cloudinary.uploader.destroy(input.providerAssetId || input.key, {
        invalidate: true,
        resource_type: normalizeResourceType(input.resourceType),
        type: getDeliveryType(input.access),
    });
}
