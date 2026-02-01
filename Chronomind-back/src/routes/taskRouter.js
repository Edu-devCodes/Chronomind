import { Router } from "express";
import TaskController from "../controllers/taskController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", TaskController.create);
router.get("/", TaskController.getAll);
router.get("/:id", TaskController.getById);
router.put("/:id", TaskController.update);
router.delete("/:id", TaskController.remove);
router.patch("/:id/complete", TaskController.complete);

export default router;
