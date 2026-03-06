import multer from "multer";
import { env } from "../../env";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: env.UPLOAD_MAX_FILE_SIZE,
        files: env.UPLOAD_MAX_FILES,
    },
});

export function uploadSingle(fieldName = "file") {
    return upload.single(fieldName);
}

export function uploadArray(fieldName = "files", maxCount = env.UPLOAD_MAX_FILES) {
    return upload.array(fieldName, maxCount);
}

export function uploadFields(fields: Array<{ name: string; maxCount?: number }>) {
    return upload.fields(fields);
}
