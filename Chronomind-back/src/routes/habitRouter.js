import { Router } from "express";
import {
  listHabits,
  createHabit,
  toggleHabit,
  deleteHabit,
  updateHabit
} from "../controllers/habitController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", listHabits);
router.post("/", createHabit);
router.put("/:id", updateHabit);        // 🔥 UPDATE
router.patch("/:id/toggle", toggleHabit);
router.delete("/:id", deleteHabit);

export default router;
