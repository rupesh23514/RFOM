export type UserRole = "customer" | "restaurant_owner" | "delivery" | "admin";

export type SavedAddress = {
  _id?: string;
  label: string;
  addressLine1: string;
  city: string;
  country: string;
  pincode: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
};

export type User = {
  _id: string;
  email: string;
  name: string;
  addressLine1: string;
  city: string;
  country: string;
  role: UserRole;
  phone?: string;
  image?: string;
  savedAddresses?: SavedAddress[];
  favorites?: string[];
  defaultAddressIndex?: number;
};

// ─── Menu Item (Swiggy/Zomato style) ─────────────────────────────
export type MenuItem = {
  _id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isVeg?: boolean;
  category?: string;
  isAvailable?: boolean;
  isPopular?: boolean;
  spiceLevel?: "mild" | "medium" | "hot" | "extra-hot";
};

// ─── Restaurant Offer ─────────────────────────────────────────────
export type RestaurantOffer = {
  code: string;
  description: string;
  discountPercent: number;
  maxDiscount: number;
  minOrder: number;
};

// ─── Opening Hours ────────────────────────────────────────────────
export type OpeningHours = {
  open: string;
  close: string;
};

// ─── Restaurant (Swiggy/Zomato style) ─────────────────────────────
export type Restaurant = {
  _id: string;
  user: string;
  restaurantName: string;
  city: string;
  country: string;
  deliveryPrice: number;
  estimatedDeliveryTime: number;
  cuisines: string[];
  menuItems: MenuItem[];
  imageUrl: string;
  lastUpdated: string;

  // Swiggy/Zomato fields
  isVeg?: boolean;
  rating?: number;
  totalRatings?: number;
  tags?: string[];
  isOpen?: boolean;
  openingHours?: OpeningHours;
  address?: string;
  phone?: string;
  minOrderAmount?: number;
  avgCostForTwo?: number;
  offers?: RestaurantOffer[];
};

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "paid"
  | "preparing"
  | "inProgress"
  | "outForDelivery"
  | "delivered"
  | "cancelled";

// ─── Cart Item in Order ───────────────────────────────────────────
export type OrderCartItem = {
  menuItemId: string;
  name: string;
  quantity: number;
  price?: number;
  isVeg?: boolean;
};

// ─── Status History Entry ─────────────────────────────────────────
export type StatusHistoryEntry = {
  status: string;
  timestamp: string;
  note?: string;
};

export type Order = {
  _id: string;
  restaurant: Restaurant;
  user: User;
  cartItems: OrderCartItem[];
  deliveryDetails: {
    name: string;
    addressLine1: string;
    city: string;
    email: string;
    phone?: string;
    pincode?: string;
  };
  totalAmount?: number;
  status: OrderStatus;
  createdAt: string;
  restaurantId: string;

  // Swiggy/Zomato fields
  deliveryPartner?: User;
  estimatedDeliveryTime?: number;
  actualDeliveryTime?: string;
  statusHistory?: StatusHistoryEntry[];
  isReviewed?: boolean;
  deliveryInstructions?: string;
  couponCode?: string;
  discount?: number;
  taxes?: number;
  packagingCharges?: number;
  tip?: number;
};

// ─── Review (Zomato-style) ────────────────────────────────────────
export type Review = {
  _id: string;
  user: User;
  restaurant: string;
  order: string;
  rating: number;
  comment: string;
  images?: string[];
  likes?: number;
  foodRating?: number;
  deliveryRating?: number;
  packagingRating?: number;
  ownerReply?: string;
  ownerReplyDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type RestaurantSearchResponse = {
  data: Restaurant[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};
