import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  UtensilsCrossed,
  Package,
  BarChart3,
  LogIn,
  Store,
  Truck,
} from "lucide-react";
import UsernameMenu from "./UsernameMenu";
import { useAppContext } from "@/contexts/AppContext";

const linkClass =
  "flex items-center gap-2 w-full py-3 font-bold hover:text-orange-500 transition-colors";

const MobileNavLinks = () => {
  const { isLoggedIn, userRole } = useAppContext();

  const showMyOrders = isLoggedIn && (userRole === "customer" || userRole === "admin");
  const showMyRestaurant = isLoggedIn && (userRole === "restaurant_owner" || userRole === "admin");
  const showDashboard = isLoggedIn && (userRole === "restaurant_owner" || userRole === "admin");
  const showDelivery = isLoggedIn && (userRole === "delivery" || userRole === "admin");

  return (
    <div className="flex flex-col gap-1">
      <Link to="/search/all" className={linkClass}>
        <UtensilsCrossed className="h-4 w-4" />
        Restaurants
      </Link>
      {showMyOrders && (
        <Link to="/order-status" className={linkClass}>
          <Package className="h-4 w-4" />
          My Orders
        </Link>
      )}
      {showMyRestaurant && (
        <Link to="/manage-restaurant" className={linkClass}>
          <Store className="h-4 w-4" />
          My Restaurant
        </Link>
      )}
      {showDashboard && (
        <Link to="/business-insights" className={linkClass}>
          <BarChart3 className="h-4 w-4" />
          Dashboard
        </Link>
      )}
      {showDelivery && (
        <Link to="/delivery-dashboard" className={linkClass}>
          <Truck className="h-4 w-4" />
          Deliveries
        </Link>
      )}

      <div className="h-px bg-border my-4" />

      <div className="min-h-[52px] flex items-center justify-center">
        {isLoggedIn ? (
          <UsernameMenu />
        ) : (
          <Link to="/sign-in" className="w-full">
            <Button className="w-full font-bold bg-orange-500 hover:bg-orange-600">
              <LogIn className="h-4 w-4 mr-2" />
              Log In
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default MobileNavLinks;
