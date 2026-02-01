import express from "express";
import {
  finishPomodoroSession,
  getTodayPomodoros
} from "../controllers/pomodoroController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/finish", authMiddleware, finishPomodoroSession);
router.get("/today", authMiddleware, getTodayPomodoros);

export default router;
