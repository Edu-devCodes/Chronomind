import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  attCheckpoint
} from "../controllers/goalController.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createGoal);
router.get("/", getGoals);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);
router.put("/attCheckpoint/:id", attCheckpoint);



export default router;
