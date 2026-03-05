import { Request, Response } from "express";
import Review from "../models/review";
import Restaurant from "../models/restaurant";
import Order from "../models/order";
import mongoose from "mongoose";

/**
 * Create a review for an order
 */
const createReview = async (req: Request, res: Response) => {
  try {
    const { orderId, rating, comment, foodRating, deliveryRating, packagingRating } =
      req.body;

    if (!orderId || !rating) {
      return res.status(400).json({ message: "orderId and rating are required" });
    }

    // Validate order belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user?.toString() !== req.userId) {
      return res.status(403).json({ message: "Not your order" });
    }
    if (order.status !== "delivered") {
      return res.status(400).json({ message: "Can only review delivered orders" });
    }

    // Check if already reviewed
    const existing = await Review.findOne({ order: orderId });
    if (existing) {
      return res.status(409).json({ message: "Order already reviewed" });
    }

    const review = new Review({
      user: req.userId,
      restaurant: order.restaurant,
      order: orderId,
      rating,
      comment: comment || "",
      foodRating,
      deliveryRating,
      packagingRating,
    });

    await review.save();

    // Mark order as reviewed
    order.isReviewed = true;
    await order.save();

    // Update restaurant average rating
    const allReviews = await Review.find({ restaurant: order.restaurant });
    const total = allReviews.reduce((sum: number, r: any) => sum + (r.rating as number), 0);
    const avgRating = total / allReviews.length;

    await Restaurant.findByIdAndUpdate(order.restaurant, {
      rating: Math.round(avgRating * 10) / 10,
      totalRatings: allReviews.length,
    });

    const populated = await Review.findById(review._id).populate("user", "name image");
    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Error creating review" });
  }
};

/**
 * Get all reviews for a restaurant
 */
const getRestaurantReviews = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "recent";

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const sortOption: Record<string, 1 | -1> =
      sortBy === "highest"
        ? { rating: -1, createdAt: -1 }
        : sortBy === "lowest"
        ? { rating: 1, createdAt: -1 }
        : { createdAt: -1 };

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ restaurant: restaurantId })
      .populate("user", "name image")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await Review.countDocuments({ restaurant: restaurantId });

    // Calculate rating breakdown
    const allReviews = await Review.find({ restaurant: restaurantId }).select("rating");
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
    allReviews.forEach((r) => {
      const key = Math.round(r.rating);
      if (key >= 1 && key <= 5) breakdown[key]++;
    });

    res.json({
      reviews,
      pagination: { total, page, pages: Math.ceil(total / limit) },
      breakdown,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

/**
 * Owner reply to a review
 */
const replyToReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;

    const review = await Review.findById(reviewId).populate("restaurant");
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Verify the user owns the restaurant
    const restaurant = await Restaurant.findById(review.restaurant);
    if (!restaurant || restaurant.user?.toString() !== req.userId) {
      return res.status(403).json({ message: "Not your restaurant" });
    }

    review.ownerReply = reply;
    review.ownerReplyDate = new Date();
    await review.save();

    res.json(review);
  } catch (error) {
    console.error("Error replying to review:", error);
    res.status(500).json({ message: "Error replying to review" });
  }
};

export default {
  createReview,
  getRestaurantReviews,
  replyToReview,
};
