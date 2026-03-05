import { Request, Response } from "express";
import User from "../models/user";
import Restaurant from "../models/restaurant";
import mongoose from "mongoose";

/**
 * Get user's favorite restaurants
 */
const getFavorites = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).populate("favorites");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.favorites || []);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Error fetching favorites" });
  }
};

/**
 * Toggle favorite restaurant
 */
const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const favIndex = user.favorites?.findIndex(
      (fav) => fav.toString() === restaurantId
    );

    let isFavorite: boolean;
    if (favIndex !== undefined && favIndex > -1) {
      // Remove from favorites
      user.favorites?.splice(favIndex, 1);
      isFavorite = false;
    } else {
      // Add to favorites
      user.favorites?.push(new mongoose.Types.ObjectId(restaurantId));
      isFavorite = true;
    }

    await user.save();
    res.json({ isFavorite, restaurantId });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ message: "Error toggling favorite" });
  }
};

/**
 * Check if restaurant is a favorite
 */
const checkFavorite = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFavorite = user.favorites?.some(
      (fav) => fav.toString() === restaurantId
    );
    res.json({ isFavorite: !!isFavorite });
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(500).json({ message: "Error checking favorite" });
  }
};

export default {
  getFavorites,
  toggleFavorite,
  checkFavorite,
};
