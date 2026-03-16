import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import Order from "../models/order";
import { getIO } from "../socket";

const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    // Return null when no restaurant (allows frontend to show create form)
    res.json(restaurant ?? null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching restaurant" });
  }
};

const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    const existingRestaurant = await Restaurant.findOne({ user: req.userId });

    if (existingRestaurant) {
      return res
        .status(409)
        .json({ message: "User restaurant already exists" });
    }

    let imageUrl = PLACEHOLDER_IMAGE;
    if (req.file) {
      imageUrl = await uploadImage(req.file as Express.Multer.File);
    }

    // Convert deliveryPrice and menuItems.price to integer paise
    const deliveryPrice = req.body.deliveryPrice
      ? Math.round(parseFloat(req.body.deliveryPrice) * 100)
      : 0;
    const menuItems = Array.isArray(req.body.menuItems)
      ? req.body.menuItems.map((item: any) => ({
          ...item,
          price: item.price ? Math.round(parseFloat(item.price) * 100) : 0,
          description: item.description || "",
          imageUrl: item.imageUrl || "",
          isVeg: item.isVeg === "true" || item.isVeg === true,
          category: item.category || "Main Course",
          isAvailable: item.isAvailable !== "false" && item.isAvailable !== false,
          isPopular: item.isPopular === "true" || item.isPopular === true,
          spiceLevel: item.spiceLevel || "medium",
        }))
      : [];

    const minOrderAmount = req.body.minOrderAmount
      ? Math.round(parseFloat(req.body.minOrderAmount) * 100)
      : 0;
    const avgCostForTwo = req.body.avgCostForTwo
      ? Math.round(parseFloat(req.body.avgCostForTwo) * 100)
      : 0;

    const restaurant = new Restaurant({
      ...req.body,
      deliveryPrice,
      menuItems,
      minOrderAmount,
      avgCostForTwo,
      isVeg: req.body.isVeg === "true" || req.body.isVeg === true,
    });
    restaurant.imageUrl = imageUrl;
    restaurant.user = new mongoose.Types.ObjectId(req.userId);
    restaurant.lastUpdated = new Date();
    await restaurant.save();

    // Emit real-time event: restaurant created (broadcast to all clients)
    const io = getIO();
    io.emit("restaurant-updated", {
      restaurantId: restaurant._id,
      action: "created",
    });

    res.status(201).send(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({
      user: req.userId,
    });

    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }

    // Convert deliveryPrice and menuItems.price to integer paise
    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.country = req.body.country;
    restaurant.deliveryPrice = req.body.deliveryPrice
      ? Math.round(parseFloat(req.body.deliveryPrice) * 100)
      : 0;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.cuisines = req.body.cuisines;
    restaurant.menuItems = Array.isArray(req.body.menuItems)
      ? req.body.menuItems.map((item: any) => ({
          ...item,
          price: item.price ? Math.round(parseFloat(item.price) * 100) : 0,
          description: item.description || "",
          imageUrl: item.imageUrl || "",
          isVeg: item.isVeg === "true" || item.isVeg === true,
          category: item.category || "Main Course",
          isAvailable: item.isAvailable !== "false" && item.isAvailable !== false,
          isPopular: item.isPopular === "true" || item.isPopular === true,
          spiceLevel: item.spiceLevel || "medium",
        }))
      : [];
    restaurant.lastUpdated = new Date();

    // Update new Swiggy/Zomato fields
    restaurant.isVeg = req.body.isVeg === "true" || req.body.isVeg === true;
    restaurant.address = req.body.address || restaurant.address;
    restaurant.phone = req.body.phone || restaurant.phone;
    restaurant.minOrderAmount = req.body.minOrderAmount
      ? Math.round(parseFloat(req.body.minOrderAmount) * 100)
      : restaurant.minOrderAmount;
    restaurant.avgCostForTwo = req.body.avgCostForTwo
      ? Math.round(parseFloat(req.body.avgCostForTwo) * 100)
      : restaurant.avgCostForTwo;
    if (req.body.openingHours) restaurant.openingHours = req.body.openingHours;
    if (req.body.tags) restaurant.tags = req.body.tags;

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      restaurant.imageUrl = imageUrl;
    }

    await restaurant.save();

    // Emit real-time event: restaurant updated (broadcast to all clients)
    const io = getIO();
    io.emit("restaurant-updated", {
      restaurantId: restaurant._id,
      action: "updated",
    });

    res.status(200).send(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getMyRestaurantOrders = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.json([]);
    }

    // Return all orders for this restaurant, including 'placed' (unpaid) orders
    const orders = await Order.find({
      restaurant: restaurant._id,
    })
      .populate("restaurant")
      .populate("user");

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate that orderId is a valid MongoDB ObjectId
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID format",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    const restaurant = await Restaurant.findById(order.restaurant);

    if (restaurant?.user?._id.toString() !== req.userId) {
      return res.status(401).send();
    }

    order.status = status;
    await order.save();

    // Emit real-time events for order status change
    const io = getIO();
    // Notify the customer
    if (order.user) {
      io.to(`user-${order.user.toString()}`).emit("order-updated", {
        orderId: order._id,
        status: order.status,
      });
    }
    // Notify the restaurant owner
    if (order.restaurant) {
      io.to(`restaurant-${order.restaurant.toString()}`).emit("order-status-changed", {
        orderId: order._id,
        status: order.status,
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "unable to update order status" });
  }
};

const PLACEHOLDER_IMAGE = "https://placehold.co/800x400/orange/white?text=Restaurant";

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  // Ensure image.buffer is a Buffer or Uint8Array for Buffer.from
  const buffer: Buffer = Buffer.isBuffer(image.buffer)
    ? image.buffer
    : Buffer.from(image.buffer as ArrayBuffer);
  const base64Image = buffer.toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  try {
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    return uploadResponse.url;
  } catch (error) {
    console.warn("Cloudinary upload failed, storing image as data URI");
    return dataURI;
  }
};

export default {
  updateOrderStatus,
  getMyRestaurantOrders,
  getMyRestaurant,
  createMyRestaurant,
  updateMyRestaurant,
};
