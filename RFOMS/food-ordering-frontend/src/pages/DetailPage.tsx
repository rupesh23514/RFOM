import { useGetRestaurant } from "@/api/RestaurantApi";
import MenuItem from "@/components/MenuItem";
import OrderSummary from "@/components/OrderSummary";
import RestaurantInfo from "@/components/RestaurantInfo";
import { Card, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";

import { useParams } from "react-router-dom";
import { MenuItem as MenuItemType } from "../types";
import CheckoutButton from "@/components/CheckoutButton";
import { UserFormData } from "@/forms/user-profile-form/UserProfileForm";
import { useCreateCheckoutSession } from "@/api/OrderApi";
import { useGetRestaurantReviews } from "@/api/ReviewApi";
import { useToggleFavorite, useCheckFavorite } from "@/api/FavoriteApi";
import ReviewSection from "@/components/ReviewSection";
import {
  Clock,
  MapPin,
  Banknote,
  ShoppingCart,
  ChefHat,
  Star,
  Utensils,
  Heart,
  Leaf,
  Flame,
  Filter,
} from "lucide-react";

export type CartItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
};

const DetailPage = () => {
  const { restaurantId } = useParams();
  const { restaurant, isLoading } = useGetRestaurant(restaurantId);
  const { createCheckoutSession, isLoading: isCheckoutLoading } =
    useCreateCheckoutSession();

  // Reviews
  const { data: reviewsData } = useGetRestaurantReviews(restaurantId);

  // Favorites
  const { data: isFavorite } = useCheckFavorite(restaurantId);
  const toggleFavorite = useToggleFavorite();

  // Menu filters
  const [vegOnly, setVegOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Helper to clear cart for this restaurant
  function clearCart(restaurantId: string | undefined) {
    if (!restaurantId) return;
    sessionStorage.removeItem(`cartItems-${restaurantId}`);
  }
  // Clear cart when leaving DetailPage (unmount)
  useEffect(() => {
    return () => {
      clearCart(restaurantId);
      setCartItems([]);
    };
  }, [restaurantId]);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const storedCartItems = sessionStorage.getItem(`cartItems-${restaurantId}`);
    return storedCartItems ? JSON.parse(storedCartItems) : [];
  });

  const [showMobileCart, setShowMobileCart] = useState(false);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (menuItem: MenuItemType) => {
    setCartItems((prevCartItems) => {
      const existingCartItem = prevCartItems.find(
        (cartItem) => cartItem._id === menuItem._id
      );

      let updatedCartItems;

      if (existingCartItem) {
        updatedCartItems = prevCartItems.map((cartItem) =>
          cartItem._id === menuItem._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        updatedCartItems = [
          ...prevCartItems,
          {
            _id: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
          },
        ];
      }

      sessionStorage.setItem(
        `cartItems-${restaurantId}`,
        JSON.stringify(updatedCartItems)
      );

      return updatedCartItems;
    });
  };

  const removeFromCart = (cartItem: CartItem) => {
    setCartItems((prevCartItems) => {
      const updatedCartItems = prevCartItems.filter(
        (item) => cartItem._id !== item._id
      );

      sessionStorage.setItem(
        `cartItems-${restaurantId}`,
        JSON.stringify(updatedCartItems)
      );

      return updatedCartItems;
    });
  };

  const updateCartItemQuantity = (cartItem: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems((prevCartItems) => {
      const updatedCartItems = prevCartItems.map((item) =>
        item._id === cartItem._id ? { ...item, quantity: newQuantity } : item
      );
      sessionStorage.setItem(
        `cartItems-${restaurantId}`,
        JSON.stringify(updatedCartItems)
      );
      return updatedCartItems;
    });
  };

  const onCheckout = async (userFormData: UserFormData) => {
    if (!restaurant) {
      return;
    }

    const checkoutData = {
      cartItems: cartItems.map((cartItem) => ({
        menuItemId: cartItem._id,
        name: cartItem.name,
        quantity: cartItem.quantity.toString(),
      })),
      restaurantId: restaurant._id,
      deliveryDetails: {
        name: userFormData.name,
        addressLine1: userFormData.addressLine1,
        city: userFormData.city,
        country: userFormData.country,
        email: userFormData.email as string,
      },
    };

    await createCheckoutSession(checkoutData);
    window.location.href = "/order-status?success=true";
  };

  const getCartItemQuantity = (menuItemId: string) => {
    const item = cartItems.find((ci) => ci._id === menuItemId);
    return item?.quantity || 0;
  };

  // Compute menu categories
  const menuCategories = useMemo(() => {
    if (!restaurant) return [];
    const cats = new Set<string>();
    restaurant.menuItems.forEach((item) => {
      cats.add(item.category || "Main Course");
    });
    return Array.from(cats);
  }, [restaurant]);

  // Filter menu
  const filteredMenu = useMemo(() => {
    if (!restaurant) return [];
    return restaurant.menuItems.filter((item) => {
      if (vegOnly && item.isVeg === false) return false;
      if (selectedCategory !== "all" && (item.category || "Main Course") !== selectedCategory)
        return false;
      if (item.isAvailable === false) return false;
      return true;
    });
  }, [restaurant, vegOnly, selectedCategory]);

  // Group by category
  const groupedMenu = useMemo(() => {
    const groups: Record<string, MenuItemType[]> = {};
    filteredMenu.forEach((item) => {
      const cat = item.category || "Main Course";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredMenu]);

  if (isLoading || !restaurant) {
    return (
      <div className="flex flex-col gap-8">
        {/* Hero skeleton */}
        <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="grid md:grid-cols-[1fr_380px] gap-8">
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <Skeleton className="h-10 w-72" />
              <Skeleton className="h-5 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-8 w-32" />
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex gap-4 p-3 border rounded-xl">
                <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-xl" />
                <div className="flex-1 space-y-3 py-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-9 w-28 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <Card className="sticky top-4">
              <div className="p-6 space-y-4">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Banner */}
      <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.restaurantName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Favorite Button */}
        <button
          onClick={() => restaurantId && toggleFavorite.mutate(restaurantId)}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition-colors z-10"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-2">
              {restaurant.rating && restaurant.rating > 0 && (
                <div className={`flex items-center gap-1 text-white px-3 py-1 rounded-full text-sm font-semibold ${
                  restaurant.rating >= 4 ? "bg-green-600" : restaurant.rating >= 3 ? "bg-yellow-500" : "bg-orange-500"
                }`}>
                  <Star className="w-3.5 h-3.5 fill-white" />
                  {restaurant.rating.toFixed(1)}
                  {restaurant.totalRatings ? ` (${restaurant.totalRatings})` : ""}
                </div>
              )}
              {restaurant.isVeg && (
                <div className="flex items-center gap-1 bg-green-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                  <Leaf className="w-3 h-3" /> Pure Veg
                </div>
              )}
              {restaurant.tags?.map((tag) => (
                <span key={tag} className="bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
              {restaurant.isOpen === false && (
                <span className="bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                  Currently Closed
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
              {restaurant.restaurantName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm md:text-base">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {restaurant.address || `${restaurant.city}, ${restaurant.country}`}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-green-400" />
                {restaurant.estimatedDeliveryTime} mins delivery
              </span>
              <span className="flex items-center gap-1.5">
                <Banknote className="w-4 h-4" />
                ₹{(restaurant.deliveryPrice / 100).toFixed(0)} delivery fee
              </span>
              {restaurant.avgCostForTwo && restaurant.avgCostForTwo > 0 && (
                <span className="flex items-center gap-1.5">
                  <Utensils className="w-4 h-4" />
                  ₹{(restaurant.avgCostForTwo / 100).toFixed(0)} for two
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cuisine Tags + Offers */}
      <div className="flex flex-wrap gap-2 -mt-2">
        {restaurant.cuisines.map((cuisine) => (
          <Badge
            key={cuisine}
            variant="secondary"
            className="bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 px-3 py-1 text-sm font-medium"
          >
            {cuisine}
          </Badge>
        ))}
        {restaurant.offers?.map((offer) => (
          <Badge
            key={offer.code}
            variant="secondary"
            className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-sm font-medium"
          >
            🎉 {offer.description || `${offer.discountPercent}% OFF`} — {offer.code}
          </Badge>
        ))}
      </div>

      {/* Main Content: Menu + Cart */}
      <div className="grid md:grid-cols-[1fr_380px] gap-8">
        {/* Menu Section */}
        <div className="flex flex-col gap-6">
          {/* Menu Header + Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Utensils className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  Menu
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredMenu.length} of {restaurant.menuItems.length} items
                </p>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  vegOnly
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-green-400"
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                Veg Only
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          {menuCategories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === "all"
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({restaurant.menuItems.filter((i) => !vegOnly || i.isVeg !== false).length})
              </button>
              {menuCategories.map((cat) => {
                const count = restaurant.menuItems.filter(
                  (i) =>
                    (i.category || "Main Course") === cat &&
                    (!vegOnly || i.isVeg !== false)
                ).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Menu Items grouped by category */}
          {Object.keys(groupedMenu).length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No items match your filters</p>
              <p className="text-sm">Try adjusting veg filter or category</p>
            </div>
          ) : (
            Object.entries(groupedMenu).map(([category, items]) => (
              <div key={category} className="space-y-3">
                {selectedCategory === "all" && Object.keys(groupedMenu).length > 1 && (
                  <h3 className="text-lg font-bold text-gray-800 pt-2 border-b pb-2">
                    {category}
                    <span className="text-sm font-normal text-gray-400 ml-2">
                      ({items.length} items)
                    </span>
                  </h3>
                )}
                <div className="flex flex-col gap-4">
                  {items.map((menuItem) => (
                    <MenuItem
                      key={menuItem._id}
                      menuItem={menuItem}
                      addToCart={() => addToCart(menuItem)}
                      quantity={getCartItemQuantity(menuItem._id)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Reviews Section */}
          <ReviewSection
            restaurantId={restaurantId || ""}
            reviewsData={reviewsData}
          />
        </div>

        {/* Cart / Order Summary - Desktop */}
        <div className="hidden md:block">
          <div className="sticky top-4">
            <Card className="shadow-lg border-orange-100">
              <OrderSummary
                restaurant={restaurant}
                cartItems={cartItems}
                removeFromCart={removeFromCart}
                updateCartItemQuantity={updateCartItemQuantity}
              />
              <CardFooter className="pb-6">
                <CheckoutButton
                  disabled={cartItems.length === 0}
                  onCheckout={onCheckout}
                  isLoading={isCheckoutLoading}
                />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Cart Floating Button */}
      {totalCartItems > 0 && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
          <button
            onClick={() => setShowMobileCart(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="bg-white text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {totalCartItems}
              </span>
            </span>
            <span>View Cart</span>
            <span>
              ₹{((cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0) + restaurant.deliveryPrice) / 100).toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* Mobile Cart Overlay */}
      {showMobileCart && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileCart(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-lg">Your Order</h3>
              </div>
              <button
                onClick={() => setShowMobileCart(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              >
                &times;
              </button>
            </div>
            <Card className="border-0 shadow-none">
              <OrderSummary
                restaurant={restaurant}
                cartItems={cartItems}
                removeFromCart={removeFromCart}
                updateCartItemQuantity={updateCartItemQuantity}
              />
              <CardFooter className="pb-8">
                <CheckoutButton
                  disabled={cartItems.length === 0}
                  onCheckout={onCheckout}
                  isLoading={isCheckoutLoading}
                />
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailPage;

