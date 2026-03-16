import { Button } from "./ui/button";
import UsernameMenu from "./UsernameMenu";
import { Link } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { Search, ShoppingBag, Heart, Store, BarChart3, Truck } from "lucide-react";

const MainNav = () => {
  const { isLoggedIn, userRole } = useAppContext();

  const showMyOrders = isLoggedIn && (userRole === "customer" || userRole === "admin");
  const showMyRestaurant = isLoggedIn && (userRole === "restaurant_owner" || userRole === "admin");
  const showDashboard = isLoggedIn && (userRole === "restaurant_owner" || userRole === "admin");
  const showDelivery = isLoggedIn && (userRole === "delivery" || userRole === "admin");

  return (
    <nav className="flex items-center gap-1 lg:gap-2">
      <Link
        to="/search/all"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all"
      >
        <Search className="w-4 h-4" />
        <span className="hidden lg:inline">Search</span>
      </Link>
      {showMyOrders && (
        <Link
          to="/order-status"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden lg:inline">Orders</span>
        </Link>
      )}
      {showMyOrders && (
        <Link
          to="/favorites"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all"
        >
          <Heart className="w-4 h-4" />
          <span className="hidden lg:inline">Favourites</span>
        </Link>
      )}
      {showMyRestaurant && (
        <Link
          to="/manage-restaurant"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all"
        >
          <Store className="w-4 h-4" />
          <span className="hidden lg:inline">Restaurant</span>
        </Link>
      )}
      {showDashboard && (
        <Link
          to="/business-insights"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="hidden lg:inline">Insights</span>
        </Link>
      )}
      {showDelivery && (
        <Link
          to="/delivery-dashboard"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all"
        >
          <Truck className="w-4 h-4" />
          <span className="hidden lg:inline">Deliveries</span>
        </Link>
      )}

      {/* Auth area */}
      <div className="flex items-center ml-2">
        {isLoggedIn ? (
          <UsernameMenu />
        ) : (
          <Link to="/sign-in">
            <Button className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 shadow-md">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default MainNav;
