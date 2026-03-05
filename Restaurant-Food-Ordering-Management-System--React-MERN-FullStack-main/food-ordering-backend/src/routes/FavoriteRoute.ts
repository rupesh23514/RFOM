import express from "express";
import verifyToken from "../middleware/auth";
import FavoriteController from "../controllers/FavoriteController";

const router = express.Router();

// GET /api/favorites - Get user's favorites
router.get("/", verifyToken, FavoriteController.getFavorites);

// POST /api/favorites/:restaurantId - Toggle favorite
router.post("/:restaurantId", verifyToken, FavoriteController.toggleFavorite);

// GET /api/favorites/:restaurantId/check - Check if favorited
router.get("/:restaurantId/check", verifyToken, FavoriteController.checkFavorite);

export default router;
