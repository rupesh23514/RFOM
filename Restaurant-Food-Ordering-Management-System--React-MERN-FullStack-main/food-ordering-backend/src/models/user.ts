import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const VALID_ROLES = ["customer", "restaurant_owner", "delivery", "admin"] as const;
export type UserRole = (typeof VALID_ROLES)[number];

// ─── Saved Address Sub-Schema ─────────────────────────────────────
const savedAddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" }, // Home, Work, Other
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, default: "India" },
    pincode: { type: String, default: "" },
    lat: { type: Number },
    lng: { type: Number },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  addressLine1: { type: String },
  city: { type: String },
  country: { type: String },
  image: { type: String },
  role: {
    type: String,
    enum: VALID_ROLES,
    default: "customer",
  },

  // ── New Swiggy/Zomato fields ──
  phone: { type: String, default: "" },
  savedAddresses: { type: [savedAddressSchema], default: [] },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
  defaultAddressIndex: { type: Number, default: 0 },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
