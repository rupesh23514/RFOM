import express from "express";
import verifyToken from "../middleware/auth";
import { checkRole } from "../middleware/auth";
import AnalyticsController from "../controllers/AnalyticsController";

const router = express.Router();

// /api/business-insights — only admin and restaurant_owner can access
router.get("/", verifyToken, checkRole("admin", "restaurant_owner"), AnalyticsController.getAnalyticsData);

export default router;
