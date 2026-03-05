/**
 * Seeds 10 Indian restaurants with full Swiggy/Zomato-style data.
 *
 * Run:  npx ts-node scripts/seed-restaurants.ts
 * (from the project root, with food-ordering-backend/.env accessible)
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from backend
dotenv.config({ path: path.resolve(__dirname, "../food-ordering-backend/.env") });

/* ------------------------------------------------------------------ */
/*  Mongoose Schemas                                                   */
/* ------------------------------------------------------------------ */
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
    enum: ["customer", "restaurant_owner", "delivery", "admin"],
    default: "customer",
  },
});
userSchema.pre("save", async function (this: any, next: any) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});
const User = mongoose.model("User", userSchema);

const menuItemSchema = new mongoose.Schema({
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

const restaurantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  restaurantName: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  deliveryPrice: { type: Number, required: true },
  estimatedDeliveryTime: { type: Number, required: true },
  cuisines: [{ type: String, required: true }],
  menuItems: [menuItemSchema],
  imageUrl: { type: String, required: true },
  lastUpdated: { type: Date, required: true },
  isVeg: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  tags: { type: [String], default: [] },
  isOpen: { type: Boolean, default: true },
  address: { type: String, default: "" },
  phone: { type: String, default: "" },
  minOrderAmount: { type: Number, default: 0 },
  avgCostForTwo: { type: Number, default: 0 },
  offers: {
    type: [{ code: String, description: String, discountPercent: Number, maxDiscount: Number, minOrder: Number }],
    default: [],
  },
});
const Restaurant = mongoose.model("Restaurant", restaurantSchema);

/* ------------------------------------------------------------------ */
/*  10 Indian Restaurants                                              */
/* ------------------------------------------------------------------ */
const restaurants = [
  {
    restaurantName: "Punjab Da Dhaba",
    city: "Delhi",
    country: "India",
    deliveryPrice: 4000,
    estimatedDeliveryTime: 35,
    cuisines: ["North Indian", "Punjabi", "Tandoori"],
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    isVeg: false, rating: 4.3, totalRatings: 1250,
    tags: ["Popular", "Top Rated"], isOpen: true,
    address: "45, Chandni Chowk, Old Delhi", phone: "+91 98100 12345",
    minOrderAmount: 15000, avgCostForTwo: 50000,
    offers: [
      { code: "DHABA50", description: "50% off up to ₹100", discountPercent: 50, maxDiscount: 10000, minOrder: 15000 },
      { code: "WELCOME", description: "20% off first order", discountPercent: 20, maxDiscount: 15000, minOrder: 20000 },
    ],
    menuItems: [
      { name: "Butter Chicken", price: 28000, description: "Creamy tomato curry with tender chicken", isVeg: false, category: "Main Course", isPopular: true, spiceLevel: "medium" },
      { name: "Dal Makhani", price: 22000, description: "Slow-cooked black lentils in buttery gravy", isVeg: true, category: "Main Course", isPopular: true, spiceLevel: "mild" },
      { name: "Paneer Tikka", price: 24000, description: "Marinated cottage cheese grilled in tandoor", isVeg: true, category: "Starters", isPopular: true, spiceLevel: "medium" },
      { name: "Garlic Naan", price: 6000, description: "Soft naan with garlic and butter", isVeg: true, category: "Breads", spiceLevel: "mild" },
      { name: "Tandoori Roti", price: 3000, description: "Whole wheat bread baked in tandoor", isVeg: true, category: "Breads", spiceLevel: "mild" },
      { name: "Chicken Biryani", price: 26000, description: "Fragrant rice with spiced chicken layers", isVeg: false, category: "Rice", isPopular: true, spiceLevel: "hot" },
      { name: "Malai Kofta", price: 24000, description: "Cottage cheese dumplings in cashew gravy", isVeg: true, category: "Main Course", spiceLevel: "mild" },
      { name: "Lassi (Sweet)", price: 8000, description: "Thick chilled yogurt drink", isVeg: true, category: "Beverages", spiceLevel: "mild" },
      { name: "Gulab Jamun (2 pcs)", price: 10000, description: "Fried milk dumplings in sugar syrup", isVeg: true, category: "Desserts", isPopular: true, spiceLevel: "mild" },
      { name: "Raita", price: 5000, description: "Yogurt with cucumber and spices", isVeg: true, category: "Sides", spiceLevel: "mild" },
    ],
  },
  {
    restaurantName: "Hyderabadi Biryani House",
    city: "Hyderabad",
    country: "India",
    deliveryPrice: 3000, estimatedDeliveryTime: 40,
    cuisines: ["Hyderabadi", "Biryani", "Mughlai"],
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    isVeg: false, rating: 4.5, totalRatings: 2100,
    tags: ["Bestseller", "Top Rated"], isOpen: true,
    address: "Banjara Hills, Hyderabad", phone: "+91 98200 23456",
    minOrderAmount: 20000, avgCostForTwo: 60000,
    offers: [{ code: "BIRYANI40", description: "40% off up to ₹80", discountPercent: 40, maxDiscount: 8000, minOrder: 20000 }],
    menuItems: [
      { name: "Hyderabadi Dum Biryani", price: 30000, description: "Authentic slow-cooked biryani", isVeg: false, category: "Biryani", isPopular: true, spiceLevel: "hot" },
      { name: "Chicken 65", price: 22000, description: "Spicy deep-fried chicken with curry leaves", isVeg: false, category: "Starters", isPopular: true, spiceLevel: "extra-hot" },
      { name: "Mutton Haleem", price: 28000, description: "Slow-cooked wheat and meat stew", isVeg: false, category: "Main Course", isPopular: true, spiceLevel: "medium" },
      { name: "Veg Biryani", price: 22000, description: "Fragrant rice with seasonal vegetables", isVeg: true, category: "Biryani", spiceLevel: "medium" },
      { name: "Double Ka Meetha", price: 12000, description: "Bread pudding with saffron and nuts", isVeg: true, category: "Desserts", spiceLevel: "mild" },
      { name: "Seekh Kebab", price: 20000, description: "Minced meat skewers grilled over charcoal", isVeg: false, category: "Starters", isPopular: true, spiceLevel: "hot" },
      { name: "Mirchi Ka Salan", price: 16000, description: "Green chillies in peanut-sesame gravy", isVeg: true, category: "Main Course", spiceLevel: "hot" },
      { name: "Phirni", price: 10000, description: "Chilled rice pudding with pistachios", isVeg: true, category: "Desserts", spiceLevel: "mild" },
    ],
  },
  {
    restaurantName: "Chennai Dosa Corner",
    city: "Chennai",
    country: "India",
    deliveryPrice: 2500, estimatedDeliveryTime: 25,
    cuisines: ["South Indian", "Dosa", "Idli"],
    imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
    isVeg: true, rating: 4.1, totalRatings: 850,
    tags: ["Pure Veg", "Quick Delivery"], isOpen: true,
    address: "Anna Salai, Chennai", phone: "+91 98400 34567",
    minOrderAmount: 10000, avgCostForTwo: 25000,
    offers: [{ code: "DOSA30", description: "30% off up to ₹60", discountPercent: 30, maxDiscount: 6000, minOrder: 10000 }],
    menuItems: [
      { name: "Masala Dosa", price: 12000, description: "Crispy crepe with spiced potato filling", isVeg: true, category: "Dosa", isPopular: true, spiceLevel: "medium" },
      { name: "Rava Dosa", price: 14000, description: "Crispy semolina crepe with onion", isVeg: true, category: "Dosa", isPopular: true, spiceLevel: "mild" },
      { name: "Idli Sambar (4 pcs)", price: 8000, description: "Steamed rice cakes with lentil soup", isVeg: true, category: "Tiffin", isPopular: true, spiceLevel: "mild" },
      { name: "Medu Vada (2 pcs)", price: 7000, description: "Crispy lentil fritters", isVeg: true, category: "Tiffin", spiceLevel: "mild" },
      { name: "Uttapam", price: 11000, description: "Thick pancake topped with vegetables", isVeg: true, category: "Dosa", spiceLevel: "mild" },
      { name: "Mysore Masala Dosa", price: 15000, description: "Dosa with spicy red chutney", isVeg: true, category: "Dosa", isPopular: true, spiceLevel: "hot" },
      { name: "Filter Coffee", price: 5000, description: "Traditional South Indian filter coffee", isVeg: true, category: "Beverages", isPopular: true, spiceLevel: "mild" },
      { name: "Pongal", price: 10000, description: "Rice and moong dal with pepper and cumin", isVeg: true, category: "Tiffin", spiceLevel: "mild" },
    ],
  },
  {
    restaurantName: "Mumbai Street Bites",
    city: "Mumbai",
    country: "India",
    deliveryPrice: 3500, estimatedDeliveryTime: 30,
    cuisines: ["Street Food", "Chaat", "Fast Food"],
    imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
    isVeg: false, rating: 4.0, totalRatings: 670,
    tags: ["Popular", "Budget Friendly"], isOpen: true,
    address: "Marine Drive, Mumbai", phone: "+91 98300 45678",
    minOrderAmount: 10000, avgCostForTwo: 30000,
    offers: [{ code: "STREET25", description: "25% off up to ₹50", discountPercent: 25, maxDiscount: 5000, minOrder: 10000 }],
    menuItems: [
      { name: "Vada Pav", price: 5000, description: "Potato fritter in bun with chutneys", isVeg: true, category: "Street Food", isPopular: true, spiceLevel: "hot" },
      { name: "Pav Bhaji", price: 14000, description: "Spiced veggie mash with buttery pav", isVeg: true, category: "Street Food", isPopular: true, spiceLevel: "medium" },
      { name: "Bhel Puri", price: 8000, description: "Puffed rice with tamarind chutneys", isVeg: true, category: "Chaat", isPopular: true, spiceLevel: "medium" },
      { name: "Sev Puri", price: 9000, description: "Crispy puris with potato and sev", isVeg: true, category: "Chaat", spiceLevel: "medium" },
      { name: "Chole Bhature", price: 16000, description: "Chickpeas with fluffy fried bread", isVeg: true, category: "Main Course", isPopular: true, spiceLevel: "hot" },
      { name: "Misal Pav", price: 13000, description: "Spicy sprouts curry with pav", isVeg: true, category: "Main Course", spiceLevel: "extra-hot" },
      { name: "Chicken Frankie", price: 12000, description: "Spiced chicken wrapped in roti", isVeg: false, category: "Rolls", isPopular: true, spiceLevel: "medium" },
      { name: "Cutting Chai", price: 3000, description: "Strong sweet masala tea", isVeg: true, category: "Beverages", isPopular: true, spiceLevel: "mild" },
    ],
  },
  {
    restaurantName: "Rajasthani Rasoi",
    city: "Jaipur",
    country: "India",
    deliveryPrice: 3000, estimatedDeliveryTime: 45,
    cuisines: ["Rajasthani", "Thali", "North Indian"],
    imageUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80",
    isVeg: true, rating: 4.4, totalRatings: 530,
    tags: ["Pure Veg", "Thali Specialist"], isOpen: true,
    address: "MI Road, Jaipur", phone: "+91 98500 56789",
    minOrderAmount: 20000, avgCostForTwo: 55000,
    offers: [{ code: "THALI20", description: "20% off on Thali", discountPercent: 20, maxDiscount: 10000, minOrder: 25000 }],
    menuItems: [
      { name: "Rajasthani Thali", price: 35000, description: "Complete meal with dal, sabzi, roti, rice", isVeg: true, category: "Thali", isPopular: true, spiceLevel: "medium" },
      { name: "Dal Baati Churma", price: 25000, description: "Baked wheat balls with lentils", isVeg: true, category: "Main Course", isPopular: true, spiceLevel: "mild" },
      { name: "Gatte Ki Sabzi", price: 18000, description: "Gram flour dumplings in yogurt curry", isVeg: true, category: "Main Course", spiceLevel: "medium" },
      { name: "Ker Sangri", price: 16000, description: "Desert beans and berries dish", isVeg: true, category: "Main Course", spiceLevel: "hot" },
      { name: "Pyaaz Ki Kachori", price: 8000, description: "Crispy onion-filled pastry", isVeg: true, category: "Starters", isPopular: true, spiceLevel: "medium" },
      { name: "Ghevar", price: 15000, description: "Disc-shaped sweet soaked in syrup", isVeg: true, category: "Desserts", isPopular: true, spiceLevel: "mild" },
      { name: "Malpua", price: 12000, description: "Sweet pancakes in sugar syrup", isVeg: true, category: "Desserts", spiceLevel: "mild" },
    ],
  },
  {
    restaurantName: "Kerala Spice Garden",
    city: "Kochi",
    country: "India",
    deliveryPrice: 3500, estimatedDeliveryTime: 40,
    cuisines: ["Kerala", "Coastal", "South Indian"],
    imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
    isVeg: false, rating: 4.2, totalRatings: 420,
    tags: ["Coastal Specials"], isOpen: true,
    address: "Fort Kochi, Ernakulam", phone: "+91 98600 67890",
    minOrderAmount: 15000, avgCostForTwo: 55000,
    offers: [{ code: "KERALA35", description: "35% off up to ₹120", discountPercent: 35, maxDiscount: 12000, minOrder: 20000 }],
    menuItems: [
      { name: "Kerala Fish Curry", price: 28000, description: "Tangy fish curry with coconut", isVeg: false, category: "Main Course", isPopular: true, spiceLevel: "hot" },
      { name: "Appam with Stew", price: 18000, description: "Lacy rice pancake with veg stew", isVeg: true, category: "Tiffin", isPopular: true, spiceLevel: "mild" },
      { name: "Puttu & Kadala", price: 12000, description: "Steamed rice cake with chickpea curry", isVeg: true, category: "Tiffin", spiceLevel: "medium" },
      { name: "Malabar Parotta", price: 6000, description: "Flaky layered flatbread", isVeg: true, category: "Breads", isPopular: true, spiceLevel: "mild" },
      { name: "Prawn Fry", price: 26000, description: "Crispy fried prawns with spices", isVeg: false, category: "Starters", isPopular: true, spiceLevel: "hot" },
      { name: "Payasam", price: 10000, description: "Sweet vermicelli pudding", isVeg: true, category: "Desserts", spiceLevel: "mild" },
      { name: "Thalassery Biryani", price: 30000, description: "Kerala-style fragrant biryani", isVeg: false, category: "Biryani", isPopular: true, spiceLevel: "medium" },
    ],
  },
  {
    restaurantName: "Kolkata Roll Junction",
    city: "Kolkata",
    country: "India",
    deliveryPrice: 2500, estimatedDeliveryTime: 25,
    cuisines: ["Street Food", "Mughlai", "Rolls"],
    imageUrl: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&q=80",
    isVeg: false, rating: 3.9, totalRatings: 310,
    tags: ["Quick Delivery", "Budget Friendly"], isOpen: true,
    address: "Park Street, Kolkata", phone: "+91 98700 78901",
    minOrderAmount: 10000, avgCostForTwo: 25000,
    offers: [{ code: "ROLL20", description: "20% off up to ₹40", discountPercent: 20, maxDiscount: 4000, minOrder: 10000 }],
    menuItems: [
      { name: "Egg Roll (Kathi)", price: 10000, description: "Egg-wrapped roti with spicy filling", isVeg: false, category: "Rolls", isPopular: true, spiceLevel: "medium" },
      { name: "Chicken Roll", price: 14000, description: "Chicken tikka in paratha wrap", isVeg: false, category: "Rolls", isPopular: true, spiceLevel: "medium" },
      { name: "Paneer Roll", price: 12000, description: "Grilled paneer in roti wrap", isVeg: true, category: "Rolls", spiceLevel: "mild" },
      { name: "Mutton Roll", price: 16000, description: "Tender mutton kebab in paratha", isVeg: false, category: "Rolls", isPopular: true, spiceLevel: "hot" },
      { name: "Fish Fry", price: 18000, description: "Bengali-style crispy fried bhetki", isVeg: false, category: "Starters", isPopular: true, spiceLevel: "medium" },
      { name: "Chowmein", price: 12000, description: "Indo-Chinese stir-fried noodles", isVeg: false, category: "Chinese", spiceLevel: "medium" },
      { name: "Mishti Doi", price: 8000, description: "Sweet caramelized yogurt", isVeg: true, category: "Desserts", isPopular: true, spiceLevel: "mild" },
      { name: "Rasgulla (2 pcs)", price: 7000, description: "Soft cheese balls in sugar syrup", isVeg: true, category: "Desserts", spiceLevel: "mild" },
    ],
  },
  {
    restaurantName: "Gujarati Bhojanalaya",
    city: "Ahmedabad",
    country: "India",
    deliveryPrice: 2000, estimatedDeliveryTime: 30,
    cuisines: ["Gujarati", "Thali", "Vegetarian"],
    imageUrl: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80",
    isVeg: true, rating: 4.6, totalRatings: 780,
    tags: ["Pure Veg", "Top Rated"], isOpen: true,
    address: "CG Road, Ahmedabad", phone: "+91 98800 89012",
    minOrderAmount: 15000, avgCostForTwo: 45000,
    offers: [{ code: "GUJJU30", description: "30% off up to ₹100", discountPercent: 30, maxDiscount: 10000, minOrder: 15000 }],
    menuItems: [
      { name: "Gujarati Thali (Unlimited)", price: 30000, description: "Full unlimited thali with rotli, dal, rice, sabzi", isVeg: true, category: "Thali", isPopular: true, spiceLevel: "mild" },
      { name: "Dhokla", price: 8000, description: "Steamed gram flour cake", isVeg: true, category: "Starters", isPopular: true, spiceLevel: "mild" },
      { name: "Khandvi", price: 10000, description: "Rolled gram flour sheets with coconut", isVeg: true, category: "Starters", spiceLevel: "mild" },
      { name: "Undhiyu", price: 22000, description: "Mixed winter vegetables slow-cooked", isVeg: true, category: "Main Course", isPopular: true, spiceLevel: "medium" },
      { name: "Thepla with Chutney", price: 9000, description: "Spiced fenugreek flatbread", isVeg: true, category: "Breads", spiceLevel: "mild" },
      { name: "Fafda Jalebi", price: 12000, description: "Crispy chickpea strips with sweet jalebi", isVeg: true, category: "Street Food", isPopular: true, spiceLevel: "mild" },
      { name: "Shrikhand", price: 10000, description: "Sweet saffron yogurt", isVeg: true, category: "Desserts", isPopular: true, spiceLevel: "mild" },
    ],
  },
  {
    restaurantName: "Amritsari Tandoor",
    city: "Amritsar",
    country: "India",
    deliveryPrice: 3500, estimatedDeliveryTime: 35,
    cuisines: ["Punjabi", "Tandoori", "North Indian"],
    imageUrl: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&q=80",
    isVeg: false, rating: 4.3, totalRatings: 980,
    tags: ["Famous Kulchas", "Top Rated"], isOpen: true,
    address: "Lawrence Road, Amritsar", phone: "+91 98900 90123",
    minOrderAmount: 15000, avgCostForTwo: 50000,
    offers: [{ code: "TANDOOR40", description: "40% off up to ₹120", discountPercent: 40, maxDiscount: 12000, minOrder: 20000 }],
    menuItems: [
      { name: "Amritsari Kulcha", price: 14000, description: "Stuffed kulcha with chole", isVeg: true, category: "Breads", isPopular: true, spiceLevel: "medium" },
      { name: "Tandoori Chicken (Full)", price: 45000, description: "Whole chicken char-grilled in tandoor", isVeg: false, category: "Tandoori", isPopular: true, spiceLevel: "hot" },
      { name: "Amritsari Fish", price: 28000, description: "Spiced gram flour battered fried fish", isVeg: false, category: "Starters", isPopular: true, spiceLevel: "hot" },
      { name: "Sarson Da Saag & Makki Roti", price: 20000, description: "Mustard greens with corn flatbread", isVeg: true, category: "Main Course", isPopular: true, spiceLevel: "medium" },
      { name: "Paneer Tikka Masala", price: 24000, description: "Grilled paneer in spiced tomato gravy", isVeg: true, category: "Main Course", spiceLevel: "medium" },
      { name: "Chole Kulche", price: 12000, description: "Spiced chickpeas with soft kulcha", isVeg: true, category: "Main Course", isPopular: true, spiceLevel: "medium" },
      { name: "Chicken Tikka", price: 22000, description: "Boneless chicken with tandoori spices", isVeg: false, category: "Tandoori", isPopular: true, spiceLevel: "hot" },
      { name: "Phirni", price: 8000, description: "Chilled rice pudding in clay pot", isVeg: true, category: "Desserts", spiceLevel: "mild" },
    ],
  },
  {
    restaurantName: "Bangalore Bites Cafe",
    city: "Bangalore",
    country: "India",
    deliveryPrice: 3000, estimatedDeliveryTime: 30,
    cuisines: ["South Indian", "Chinese-Indian", "Cafe"],
    imageUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80",
    isVeg: false, rating: 3.8, totalRatings: 250,
    tags: ["Cafe", "Quick Bites"], isOpen: true,
    address: "Indiranagar, Bangalore", phone: "+91 99000 01234",
    minOrderAmount: 12000, avgCostForTwo: 40000,
    offers: [{ code: "BITES20", description: "20% off up to ₹60", discountPercent: 20, maxDiscount: 6000, minOrder: 12000 }],
    menuItems: [
      { name: "Bisi Bele Bath", price: 14000, description: "Spiced rice with lentils and veggies", isVeg: true, category: "Rice", isPopular: true, spiceLevel: "medium" },
      { name: "Set Dosa (3 pcs)", price: 10000, description: "Soft spongy dosas with chutney", isVeg: true, category: "Dosa", isPopular: true, spiceLevel: "mild" },
      { name: "Ragi Mudde", price: 12000, description: "Finger millet ball with sambar", isVeg: true, category: "Main Course", spiceLevel: "mild" },
      { name: "Chicken Fried Rice", price: 18000, description: "Indo-Chinese fried rice with chicken", isVeg: false, category: "Rice", isPopular: true, spiceLevel: "medium" },
      { name: "Gobi Manchurian", price: 16000, description: "Crispy cauliflower in Indo-Chinese sauce", isVeg: true, category: "Chinese", isPopular: true, spiceLevel: "hot" },
      { name: "Paneer Fried Rice", price: 16000, description: "Fried rice with paneer cubes", isVeg: true, category: "Rice", spiceLevel: "medium" },
      { name: "Fresh Lime Soda", price: 6000, description: "Lime juice with soda water", isVeg: true, category: "Beverages", spiceLevel: "mild" },
      { name: "Mango Lassi", price: 9000, description: "Thick mango yogurt smoothie", isVeg: true, category: "Beverages", isPopular: true, spiceLevel: "mild" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Main seed function                                                 */
/* ------------------------------------------------------------------ */
async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_CONNECTION_STRING;
  if (!uri) {
    console.error("❌ Set MONGODB_URI in food-ordering-backend/.env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  // Create seed owner
  const SEED_EMAIL = "restaurant-owner@dhaba.com";
  let owner = await User.findOne({ email: SEED_EMAIL });
  if (!owner) {
    owner = new User({
      email: SEED_EMAIL, password: "Dhaba@123", name: "Dhaba Owner",
      addressLine1: "123 MG Road", city: "Delhi", country: "India", role: "restaurant_owner",
    });
    await owner.save();
    console.log(`✅ Created seed owner: ${SEED_EMAIL} / Dhaba@123`);
  } else {
    console.log(`ℹ️  Seed owner exists: ${SEED_EMAIL}`);
  }

  // Create test customer
  const CUST_EMAIL = "customer@dhaba.com";
  let customer = await User.findOne({ email: CUST_EMAIL });
  if (!customer) {
    customer = new User({
      email: CUST_EMAIL, password: "Dhaba@123", name: "Test Customer",
      addressLine1: "456 MG Road", city: "Delhi", country: "India", role: "customer",
    });
    await customer.save();
    console.log(`✅ Created test customer: ${CUST_EMAIL} / Dhaba@123`);
  } else {
    console.log(`ℹ️  Test customer exists: ${CUST_EMAIL}`);
  }

  // Clear & reseed
  const deleted = await Restaurant.deleteMany({ user: owner._id });
  console.log(`🗑️  Cleared ${deleted.deletedCount} existing seed restaurants`);

  let created = 0;
  for (const data of restaurants) {
    const r = new Restaurant({ user: owner._id, ...data, lastUpdated: new Date() });
    await r.save();
    console.log(`🍛 Created: ${data.restaurantName} — ${data.city} (${data.menuItems.length} items, ⭐${data.rating})`);
    created++;
  }

  console.log(`\n🎉 Done! Created ${created} restaurants.`);
  console.log(`\n📋 Login credentials:`);
  console.log(`   Owner:    ${SEED_EMAIL} / Dhaba@123`);
  console.log(`   Customer: ${CUST_EMAIL} / Dhaba@123`);
  process.exit(0);
}

main().catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); });
