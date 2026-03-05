import { Request, Response } from "express";
import Order from "../models/order";

/**
 * Get orders assigned to delivery driver (status: outForDelivery)
 * plus recently delivered ones for reference.
 */
const getDeliveryOrders = async (req: Request, res: Response) => {
  try {
    const statusFilter = req.query.status as string | undefined;

    const filter: Record<string, unknown> = {};

    if (statusFilter && statusFilter !== "all") {
      filter.status = statusFilter;
    } else {
      // Default: show actionable + recently delivered orders
      filter.status = { $in: ["paid", "inProgress", "outForDelivery", "delivered"] };
    }

    const orders = await Order.find(filter)
      .populate("restaurant")
      .populate("user")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(orders);
  } catch (error) {
    console.error("Error fetching delivery orders:", error);
    res.status(500).json({ message: "Error fetching delivery orders" });
  }
};

/**
 * Update order status (delivery driver can mark outForDelivery → delivered)
 */
const updateDeliveryStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Delivery drivers can only set specific statuses
    const allowedTransitions = ["outForDelivery", "delivered"];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        message: `Delivery drivers can only set status to: ${allowedTransitions.join(", ")}`,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate("restaurant")
      .populate("user");

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Error updating delivery status" });
  }
};

/**
 * Get delivery stats for the driver dashboard
 */
const getDeliveryStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [outForDelivery, deliveredToday, totalPending] = await Promise.all([
      Order.countDocuments({ status: "outForDelivery" }),
      Order.countDocuments({ status: "delivered", createdAt: { $gte: today } }),
      Order.countDocuments({ status: { $in: ["paid", "inProgress"] } }),
    ]);

    res.json({
      outForDelivery,
      deliveredToday,
      totalPending,
    });
  } catch (error) {
    console.error("Error fetching delivery stats:", error);
    res.status(500).json({ message: "Error fetching delivery stats" });
  }
};

export default {
  getDeliveryOrders,
  updateDeliveryStatus,
  getDeliveryStats,
};
