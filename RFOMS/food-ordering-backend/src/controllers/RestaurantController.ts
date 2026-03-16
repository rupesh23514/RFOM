import { Request, Response } from "express";
import mongoose from "mongoose";
import Restaurant from "../models/restaurant";

const getRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.params.restaurantId;

    // Validate that restaurantId is a valid MongoDB ObjectId
    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        message: "Invalid restaurant ID format",
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }

    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

const searchRestaurant = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;
    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedCuisines = (req.query.selectedCuisines as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;
    const isVeg = req.query.isVeg as string;
    const minRating = parseFloat(req.query.minRating as string) || 0;

    let query: any = {};

    // If city is 'all' or empty, do not filter by city
    if (city && city.toLowerCase() !== "all") {
      query["city"] = new RegExp(city, "i");
    }

    // Veg filter
    if (isVeg === "true") {
      query["isVeg"] = true;
    }

    // Minimum rating filter
    if (minRating > 0) {
      query["rating"] = { $gte: minRating };
    }

    if (selectedCuisines) {
      const cuisinesArray = selectedCuisines
        .split(",")
        .map((cuisine) => new RegExp(cuisine, "i"));
      query["cuisines"] = { $all: cuisinesArray };
    }

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { restaurantName: searchRegex },
        { cuisines: { $in: [searchRegex] } },
        { "menuItems.name": searchRegex },
      ];
    }

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // Handle sort options including rating
    let sortQuery: Record<string, 1 | -1> = { lastUpdated: -1 };
    switch (sortOption) {
      case "bestMatch":
        sortQuery = { rating: -1, totalRatings: -1 };
        break;
      case "rating":
        sortQuery = { rating: -1 };
        break;
      case "deliveryPrice":
        sortQuery = { deliveryPrice: 1 };
        break;
      case "estimatedDeliveryTime":
        sortQuery = { estimatedDeliveryTime: 1 };
        break;
      case "lastUpdated":
        sortQuery = { lastUpdated: -1 };
        break;
      default:
        sortQuery = { [sortOption]: 1 };
    }

    const restaurants = await Restaurant.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Restaurant.countDocuments(query);

    const response = {
      data: restaurants,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// New endpoint to get all unique cities for dropdown
const getAllCities = async (req: Request, res: Response) => {
  try {
    const cities = await Restaurant.distinct("city");
    res.json({ cities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  getRestaurant,
  searchRestaurant,
  getAllCities,
};
