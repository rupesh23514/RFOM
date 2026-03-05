import { useAppContext } from "@/contexts/AppContext";
import { Link } from "react-router-dom";
import {
  Store,
  Package,
  BarChart3,
  Truck,
  ChefHat,
  ShoppingBag,
  Settings,
  TrendingUp,
  MapPin,
  Users,
  UtensilsCrossed,
} from "lucide-react";

/**
 * Role-based dashboard panel shown on the HomePage
 * for logged-in users. Displays different quick-actions
 * and welcome content based on user role.
 */
const RoleDashboard = () => {
  const { isLoggedIn, userRole } = useAppContext();
  const userName = localStorage.getItem("user_name") || "there";

  if (!isLoggedIn) return null;

  const roleConfig = {
    customer: {
      title: `Welcome back, ${userName}!`,
      subtitle: "What would you like to eat today?",
      gradient: "from-orange-500 to-amber-500",
      icon: ShoppingBag,
      actions: [
        {
          label: "Browse Restaurants",
          desc: "Discover new flavours",
          to: "/search/all",
          icon: UtensilsCrossed,
          color: "bg-orange-100 text-orange-700",
        },
        {
          label: "My Orders",
          desc: "Track your deliveries",
          to: "/order-status",
          icon: Package,
          color: "bg-blue-100 text-blue-700",
        },
        {
          label: "My Profile",
          desc: "Update your details",
          to: "/user-profile",
          icon: Settings,
          color: "bg-purple-100 text-purple-700",
        },
      ],
    },
    restaurant_owner: {
      title: `Welcome, Chef ${userName}!`,
      subtitle: "Manage your restaurant and track orders",
      gradient: "from-green-600 to-emerald-500",
      icon: ChefHat,
      actions: [
        {
          label: "Manage Restaurant",
          desc: "Menu, orders & settings",
          to: "/manage-restaurant",
          icon: Store,
          color: "bg-green-100 text-green-700",
        },
        {
          label: "Business Insights",
          desc: "Revenue & analytics",
          to: "/business-insights",
          icon: BarChart3,
          color: "bg-blue-100 text-blue-700",
        },
        {
          label: "My Profile",
          desc: "Account settings",
          to: "/user-profile",
          icon: Settings,
          color: "bg-gray-100 text-gray-700",
        },
      ],
    },
    delivery: {
      title: `Hey, ${userName}!`,
      subtitle: "Ready to deliver some delicious food?",
      gradient: "from-blue-600 to-indigo-500",
      icon: Truck,
      actions: [
        {
          label: "Delivery Dashboard",
          desc: "View active deliveries",
          to: "/delivery-dashboard",
          icon: MapPin,
          color: "bg-blue-100 text-blue-700",
        },
        {
          label: "My Profile",
          desc: "Update your details",
          to: "/user-profile",
          icon: Settings,
          color: "bg-gray-100 text-gray-700",
        },
      ],
    },
    admin: {
      title: `Admin Panel - ${userName}`,
      subtitle: "Full access to all system features",
      gradient: "from-purple-600 to-pink-500",
      icon: Users,
      actions: [
        {
          label: "Manage Restaurant",
          desc: "Restaurant operations",
          to: "/manage-restaurant",
          icon: Store,
          color: "bg-green-100 text-green-700",
        },
        {
          label: "Business Insights",
          desc: "Analytics & reports",
          to: "/business-insights",
          icon: TrendingUp,
          color: "bg-blue-100 text-blue-700",
        },
        {
          label: "Deliveries",
          desc: "Delivery management",
          to: "/delivery-dashboard",
          icon: Truck,
          color: "bg-indigo-100 text-indigo-700",
        },
        {
          label: "All Orders",
          desc: "Order tracking",
          to: "/order-status",
          icon: Package,
          color: "bg-orange-100 text-orange-700",
        },
      ],
    },
  };

  const config = roleConfig[userRole] || roleConfig.customer;
  const RoleIcon = config.icon;

  return (
    <div className={`bg-gradient-to-r ${config.gradient} rounded-2xl p-6 md:p-8 text-white shadow-lg`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <RoleIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">{config.title}</h2>
            <p className="text-white/80 text-sm md:text-base mt-1">
              {config.subtitle}
            </p>
          </div>
        </div>
        <div className="hidden md:flex">
          <span className="px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm capitalize">
            {userRole.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {config.actions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="group bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-200 border border-white/10 hover:border-white/30"
            >
              <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                <ActionIcon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm">{action.label}</h3>
              <p className="text-xs text-white/60 mt-0.5">{action.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RoleDashboard;
