import { Router } from "express";
import { getUserSummaries } from "../controllers/summariesController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, getUserSummaries);

export default router;
