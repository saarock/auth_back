
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { changeNotificationStatus } from "../controllers/notification.controller.js";
const router = Router();

router.patch("/change-read-status", verifyJWT, changeNotificationStatus);

export default router;
