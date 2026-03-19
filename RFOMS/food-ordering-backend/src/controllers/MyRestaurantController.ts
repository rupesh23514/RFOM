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

// ── CSV Report Download ───────────────────────────────────────────
const escapeCSV = (value: string): string => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const downloadReport = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "No restaurant found for this owner" });
    }

    // Build date filter
    const filter: Record<string, unknown> = { restaurant: restaurant._id };
    const fromDate = req.query.from ? new Date(req.query.from as string) : null;
    const toDate = req.query.to ? new Date(req.query.to as string) : null;

    if (fromDate || toDate) {
      const dateFilter: Record<string, Date> = {};
      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
        dateFilter.$gte = fromDate;
      }
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = toDate;
      }
      filter.createdAt = dateFilter;
    }

    const orders = await Order.find(filter)
      .populate("user")
      .populate("deliveryPartner")
      .sort({ createdAt: -1 });

    const toPaise = (val: number | undefined) => ((val ?? 0) / 100).toFixed(2);

    // CSV header
    const headers = [
      "Order ID",
      "Date",
      "Time",
      "Customer Name",
      "Customer Email",
      "Phone",
      "Delivery Address",
      "City",
      "Items",
      "Subtotal (₹)",
      "Delivery Charges (₹)",
      "Taxes (₹)",
      "Packaging (₹)",
      "Discount (₹)",
      "Tip (₹)",
      "Total Amount (₹)",
      "Payment Status",
      "Delivery Partner",
    ];

    const rows: string[][] = [];

    for (const order of orders) {
      const orderDate = new Date(order.createdAt);
      const dateStr = orderDate.toLocaleDateString("en-IN");
      const timeStr = orderDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

      const itemsList = (order.cartItems ?? [])
        .map((item: any) => `${item.name} x${item.quantity}`)
        .join("; ");

      // Calculate subtotal from cart items
      const subtotal = (order.cartItems ?? []).reduce(
        (sum: number, item: any) => sum + (item.price ?? 0) * (item.quantity ?? 1),
        0
      );

      const deliveryUser = order.deliveryPartner as any;
      const orderUser = order.user as any;

      rows.push([
        order._id.toString(),
        dateStr,
        timeStr,
        orderUser?.name ?? order.deliveryDetails?.name ?? "N/A",
        orderUser?.email ?? order.deliveryDetails?.email ?? "N/A",
        order.deliveryDetails?.phone ?? "",
        order.deliveryDetails?.addressLine1 ?? "",
        order.deliveryDetails?.city ?? "",
        itemsList,
        toPaise(subtotal),
        toPaise(restaurant.deliveryPrice),
        toPaise(order.taxes ?? 0),
        toPaise(order.packagingCharges ?? 0),
        toPaise(order.discount ?? 0),
        toPaise(order.tip ?? 0),
        toPaise(order.totalAmount ?? 0),
        order.status ?? "unknown",
        deliveryUser?.name ?? "Not assigned",
      ]);
    }

    // Summary section
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const deliveredCount = orders.filter((o) => o.status === "delivered").length;
    const cancelledCount = orders.filter((o) => o.status === "cancelled").length;
    const paidCount = orders.filter((o) =>
      ["paid", "inProgress", "outForDelivery", "delivered"].includes(o.status ?? "")
    ).length;
    const placedCount = orders.filter((o) => o.status === "placed").length;

    // Build CSV string
    let csv = headers.map(escapeCSV).join(",") + "\n";
    for (const row of rows) {
      csv += row.map(escapeCSV).join(",") + "\n";
    }

    // Append summary
    csv += "\n";
    csv += "REPORT SUMMARY\n";
    csv += `Restaurant,${escapeCSV(restaurant.restaurantName)}\n`;
    csv += `Report Period,${fromDate ? fromDate.toLocaleDateString("en-IN") : "All time"} to ${toDate ? toDate.toLocaleDateString("en-IN") : "Today"}\n`;
    csv += `Generated On,${new Date().toLocaleString("en-IN")}\n`;
    csv += "\n";
    csv += `Total Orders,${totalOrders}\n`;
    csv += `Orders Paid,${paidCount}\n`;
    csv += `Orders Placed (Unpaid),${placedCount}\n`;
    csv += `Orders Delivered,${deliveredCount}\n`;
    csv += `Orders Cancelled,${cancelledCount}\n`;
    csv += `Total Revenue (₹),${toPaise(totalRevenue)}\n`;
    csv += `Average Order Value (₹),${toPaise(avgOrderValue)}\n`;

    // Set response headers for CSV download
    const fileName = `${restaurant.restaurantName.replace(/[^a-zA-Z0-9]/g, "_")}_report_${
      fromDate ? fromDate.toISOString().split("T")[0] : "all"
    }_to_${toDate ? toDate.toISOString().split("T")[0] : "today"}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(csv);
  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).json({ message: "Error generating report" });
  }
};

export default {
  updateOrderStatus,
  getMyRestaurantOrders,
  getMyRestaurant,
  createMyRestaurant,
  updateMyRestaurant,
  downloadReport,
};
