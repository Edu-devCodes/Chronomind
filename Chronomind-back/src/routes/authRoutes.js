import express from "express";

import {
  sendCode,
  register,
  loginController,
  me,
  updateMe,
  logout
} from "../controllers/authController.js";

const router = express.Router();


router.post("/send-code", sendCode);
router.post("/register", register);
router.post("/login", loginController);
router.get("/me", me);
router.put("/meUpdate", updateMe);
router.post("/logout", logout);

export default router;
