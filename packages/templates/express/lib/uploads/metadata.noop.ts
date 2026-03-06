import type { UploadDescriptor, UploadRecord } from "./types";

export async function saveUploadRecord(_descriptor: UploadDescriptor): Promise<UploadRecord | null> {
    return null;
}

export async function getUploadRecordByKey(_storageKey: string): Promise<UploadRecord | null> {
    return null;
}

export async function deleteUploadRecordByKey(_storageKey: string) {
    return;
}
