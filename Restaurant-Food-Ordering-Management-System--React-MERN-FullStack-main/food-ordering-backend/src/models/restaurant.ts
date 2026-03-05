import mongoose from "mongoose";

// ─── Menu Item Schema (Swiggy/Zomato style) ──────────────────────
const menuItemSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  isVeg: { type: Boolean, default: true },
  category: { type: String, default: "Main Course" },
  isAvailable: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  spiceLevel: {
    type: String,
    enum: ["mild", "medium", "hot", "extra-hot"],
    default: "medium",
  },
});

export type MenuItemType = {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  isVeg: boolean;
  category: string;
  isAvailable: boolean;
  isPopular: boolean;
  spiceLevel: "mild" | "medium" | "hot" | "extra-hot";
};

// ─── Opening Hours Sub-Schema ─────────────────────────────────────
const openingHoursSchema = new mongoose.Schema(
  {
    open: { type: String, default: "09:00" },
    close: { type: String, default: "23:00" },
  },
  { _id: false }
);

// ─── Restaurant Schema (Swiggy/Zomato style) ─────────────────────
const restaurantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  restaurantName: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  deliveryPrice: { type: Number, required: true },
  estimatedDeliveryTime: { type: Number, required: true },
  cuisines: { type: [String], required: true },
  menuItems: { type: [menuItemSchema], required: true },
  imageUrl: { type: String, required: true },
  lastUpdated: { type: Date, required: true },

  // ── New Swiggy/Zomato fields ──
  isVeg: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  tags: { type: [String], default: [] }, // e.g. ["Top Rated", "Fast Delivery", "New"]
  isOpen: { type: Boolean, default: true },
  openingHours: { type: openingHoursSchema, default: () => ({}) },
  address: { type: String, default: "" },
  phone: { type: String, default: "" },
  minOrderAmount: { type: Number, default: 0 }, // in paise
  avgCostForTwo: { type: Number, default: 0 }, // in paise
  offers: {
    type: [
      {
        code: String,
        description: String,
        discountPercent: Number,
        maxDiscount: Number, // in paise
        minOrder: Number, // in paise
      },
    ],
    default: [],
  },
});

// Index for search performance
restaurantSchema.index({ city: 1, cuisines: 1, rating: -1 });
restaurantSchema.index({ restaurantName: "text", cuisines: "text" });

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
