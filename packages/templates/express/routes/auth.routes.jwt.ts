import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/error-handler";

const router = Router();

router.post("/sign-up/email", asyncHandler(AuthController.signUpEmail));
router.post("/sign-in/email", asyncHandler(AuthController.signInEmail));
router.post("/refresh", asyncHandler(AuthController.refreshToken));
router.post("/sign-out", asyncHandler(AuthController.signOut));
router.get("/get-session", asyncHandler(AuthController.getSession));

export default router;
