import mongoose from "mongoose";

// ─── Status History Sub-Schema ────────────────────────────────────
const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deliveryDetails: {
    email: { type: String, required: true },
    name: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, default: "" },
    pincode: { type: String, default: "" },
  },
  cartItems: [
    {
      menuItemId: { type: String, required: true },
      quantity: { type: Number, required: true },
      name: { type: String, required: true },
      price: { type: Number, default: 0 }, // price at time of order (paise)
      isVeg: { type: Boolean, default: true },
    },
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["placed", "confirmed", "paid", "preparing", "inProgress", "outForDelivery", "delivered", "cancelled"],
  },
  createdAt: { type: Date, default: Date.now },

  // ── New Swiggy/Zomato fields ──
  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  estimatedDeliveryTime: { type: Number }, // minutes
  actualDeliveryTime: { type: Date },
  statusHistory: { type: [statusHistorySchema], default: [] },
  isReviewed: { type: Boolean, default: false },
  deliveryInstructions: { type: String, default: "" },
  couponCode: { type: String, default: "" },
  discount: { type: Number, default: 0 }, // in paise
  taxes: { type: Number, default: 0 }, // in paise
  packagingCharges: { type: Number, default: 0 }, // in paise
  tip: { type: Number, default: 0 }, // in paise
});

// Index for efficient querying
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1 });
orderSchema.index({ deliveryPartner: 1, status: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
