import express from "express";
import multer from "multer";
import MyRestaurantController from "../controllers/MyRestaurantController";
import verifyToken from "../middleware/auth";
import { checkRole } from "../middleware/auth";
import { validateMyRestaurantRequest } from "../middleware/validation";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

router.get("/order", verifyToken, checkRole("restaurant_owner", "admin"), MyRestaurantController.getMyRestaurantOrders);
router.patch("/order/:orderId/status", verifyToken, checkRole("restaurant_owner", "admin"), MyRestaurantController.updateOrderStatus);
router.get("/", verifyToken, checkRole("restaurant_owner", "admin"), MyRestaurantController.getMyRestaurant);
router.post(
  "/",
  upload.single("imageFile"),
  verifyToken,
  checkRole("restaurant_owner", "admin"),
  validateMyRestaurantRequest,
  MyRestaurantController.createMyRestaurant
);
router.put(
  "/",
  upload.single("imageFile"),
  verifyToken,
  checkRole("restaurant_owner", "admin"),
  validateMyRestaurantRequest,
  MyRestaurantController.updateMyRestaurant
);

export default router;
