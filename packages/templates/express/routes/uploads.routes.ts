import { Router } from "express";
import { UploadsController } from "../controllers/uploads.controller";
import { uploadSingle } from "../lib/uploads/proxy";
import { getUploadMode } from "../lib/uploads";
import { uploadAuth } from "../middleware/upload-auth";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();

if (getUploadMode() === "proxy") {
    router.post("/", uploadAuth, uploadSingle("file"), asyncHandler(UploadsController.upload));
}

if (getUploadMode() === "direct") {
    router.post("/presign", uploadAuth, asyncHandler(UploadsController.presign));
    router.post("/complete", uploadAuth, asyncHandler(UploadsController.complete));
}

if (getUploadMode() === "large") {
    router.post("/multipart/init", uploadAuth, asyncHandler(UploadsController.initMultipart));
    router.post("/multipart/complete", uploadAuth, asyncHandler(UploadsController.completeMultipart));
    router.post("/multipart/abort", uploadAuth, asyncHandler(UploadsController.abortMultipart));
}

router.post("/access-url", uploadAuth, asyncHandler(UploadsController.accessUrl));
router.delete("/", uploadAuth, asyncHandler(UploadsController.remove));

export default router;
