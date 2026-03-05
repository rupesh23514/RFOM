import express from "express";
import verifyToken from "../middleware/auth";
import { checkRole } from "../middleware/auth";
import DeliveryController from "../controllers/DeliveryController";

const router = express.Router();

// All delivery routes require authentication + delivery or admin role
router.get("/orders", verifyToken, checkRole("delivery", "admin"), DeliveryController.getDeliveryOrders);
router.get("/stats", verifyToken, checkRole("delivery", "admin"), DeliveryController.getDeliveryStats);
router.patch("/orders/:orderId/status", verifyToken, checkRole("delivery", "admin"), DeliveryController.updateDeliveryStatus);

export default router;
