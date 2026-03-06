import { Router } from "express";
import { UploadsController } from "../controllers/uploads.controller";
import { uploadSingle } from "../lib/uploads/proxy";
import { getUploadMode } from "../lib/uploads";
import { uploadAuth } from "../middleware/upload-auth";

const router = Router();

if (getUploadMode() === "proxy") {
    router.post("/", uploadAuth, uploadSingle("file"), UploadsController.upload);
}

if (getUploadMode() === "direct") {
    router.post("/presign", uploadAuth, UploadsController.presign);
    router.post("/complete", uploadAuth, UploadsController.complete);
}

if (getUploadMode() === "large") {
    router.post("/multipart/init", uploadAuth, UploadsController.initMultipart);
    router.post("/multipart/complete", uploadAuth, UploadsController.completeMultipart);
    router.post("/multipart/abort", uploadAuth, UploadsController.abortMultipart);
}

router.post("/access-url", uploadAuth, UploadsController.accessUrl);
router.delete("/", uploadAuth, UploadsController.remove);

export default router;
