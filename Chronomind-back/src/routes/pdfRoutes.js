import express from "express";
import multer from "multer"; // funçao que execulta arquivos no back?
import { summarizePDF } from "../controllers/pdfController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/",
  upload.single("file"), // 1️⃣ primeiro
  authMiddleware,        // 2️⃣ depois
  summarizePDF
);


export default router;
