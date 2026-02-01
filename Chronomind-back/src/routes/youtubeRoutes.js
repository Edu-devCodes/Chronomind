// routes/youtubeRoutes.js
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { generateYoutubeSummary } from "../controllers/youtubeController.js";

const router = Router();

router.post("/youtube", authMiddleware, generateYoutubeSummary);

export default router;
