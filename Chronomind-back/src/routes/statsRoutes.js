import express from "express";
import { getDashboardStats } from "../controllers/statsController.js";
import { getDatadashboard } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/data", authMiddleware, getDashboardStats); 
router.get("/dashboard", authMiddleware, getDatadashboard );




export default router;
// endpoint para retornar para o front dados organizados para os graficos