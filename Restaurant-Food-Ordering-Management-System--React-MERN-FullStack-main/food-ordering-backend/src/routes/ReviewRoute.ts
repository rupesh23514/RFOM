import express from "express";
import verifyToken from "../middleware/auth";
import { checkRole } from "../middleware/auth";
import ReviewController from "../controllers/ReviewController";

const router = express.Router();

// POST /api/reviews - Create a review (customer only)
router.post("/", verifyToken, ReviewController.createReview);

// GET /api/reviews/restaurant/:restaurantId - Get reviews for a restaurant (public)
router.get("/restaurant/:restaurantId", ReviewController.getRestaurantReviews);

// POST /api/reviews/:reviewId/reply - Owner reply (restaurant_owner only)
router.post(
  "/:reviewId/reply",
  verifyToken,
  checkRole("restaurant_owner", "admin"),
  ReviewController.replyToReview
);

export default router;
