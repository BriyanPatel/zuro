export type UploadProvider = "s3" | "r2" | "cloudinary";
export type UploadMode = "proxy" | "direct" | "large";
export type UploadAuthMode = "required" | "none";
export type UploadAccess = "public" | "private";
export type UploadPreset = "image" | "document" | "video";

export interface UploadDescriptor {
    key: string;
    provider: UploadProvider;
    access: UploadAccess;
    originalName: string;
    mimeType: string;
    bytes: number;
    ownerId?: string | null;
    url?: string | null;
    providerAssetId?: string | null;
    resourceType?: string | null;
}

export interface PreparedDirectUpload {
    provider: UploadProvider;
    key: string;
    method: "PUT" | "POST";
    uploadUrl: string;
    expiresInSeconds?: number;
    headers?: Record<string, string>;
    fields?: Record<string, string>;
}

export interface CompletedUploadPart {
    partNumber: number;
    etag: string;
}

export interface MultipartUploadPlan {
    provider: UploadProvider;
    key: string;
    uploadId: string;
    partSize: number;
    parts: Array<{
        partNumber: number;
        url: string;
    }>;
}

export interface UploadRecord {
    id: string;
    storageKey: string;
    provider: UploadProvider;
    access: UploadAccess;
    originalName: string;
    mimeType: string;
    bytes: number;
    ownerId?: string | null;
    providerAssetId?: string | null;
    resourceType?: string | null;
    createdAt?: Date | string;
}
