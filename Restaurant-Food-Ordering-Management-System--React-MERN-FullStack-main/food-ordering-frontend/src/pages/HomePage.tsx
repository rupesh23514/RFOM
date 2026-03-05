import { useNavigate } from "react-router-dom";
import { Clock, MapPin, Star, Leaf, ArrowRight, Utensils, TrendingUp, Zap, Shield, Loader2 } from "lucide-react";
import { useSearchRestaurants } from "@/api/RestaurantApi";
import RoleDashboard from "@/components/RoleDashboard";

const POPULAR_CUISINES = [
  { name: "Biryani", emoji: "🍛", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&q=80" },
  { name: "Pizza", emoji: "🍕", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80" },
  { name: "Dosa", emoji: "🥞", img: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200&q=80" },
  { name: "Burger", emoji: "🍔", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80" },
  { name: "Tandoori", emoji: "🍗", img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200&q=80" },
  { name: "Thali", emoji: "🍱", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&q=80" },
  { name: "Chinese", emoji: "🥡", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&q=80" },
  { name: "South Indian", emoji: "🌿", img: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=200&q=80" },
];

const HomePage = () => {
  const navigate = useNavigate();

  // Fetch real restaurants from the API (search "all" cities)
  const { results, isLoading } = useSearchRestaurants(
    {
      searchQuery: "",
      page: 1,
      selectedCuisines: [],
      sortOption: "bestMatch",
    },
    "all"
  );
  const restaurants = results?.data ?? [];

  return (
    <div className="space-y-12 -mt-4">
      {/* Role-based Dashboard */}
      <RoleDashboard />

      {/* ─── What's on your mind? (Swiggy-style cuisine carousel) ─── */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          What's on your mind?
        </h2>
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {POPULAR_CUISINES.map((c) => (
            <button
              key={c.name}
              onClick={() =>
                navigate(`/search/all?searchQuery=${encodeURIComponent(c.name)}`)
              }
              className="flex flex-col items-center gap-2 min-w-[100px] group"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-orange-400 transition-all shadow-md group-hover:shadow-lg">
                <img
                  src={c.img}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="border-t border-gray-200" />

      {/* ─── Top restaurant chains (Swiggy style horizontal scroll) ─── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Top restaurant chains in India
          </h2>
          <button
            onClick={() => navigate("/search/all")}
            className="text-orange-500 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            See all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {isLoading ? (
            <div className="flex items-center justify-center w-full py-10">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : (
            restaurants.map((r) => (
              <div
                key={r._id}
                onClick={() => navigate(`/detail/${r._id}`)}
                className="min-w-[280px] max-w-[280px] bg-white rounded-2xl overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={r.imageUrl}
                    alt={r.restaurantName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Gradient overlay at bottom - Swiggy style */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />

                  {/* Offer badge - bottom left */}
                  <div className="absolute bottom-2 left-3">
                    <span className="text-white font-extrabold text-xl tracking-tight drop-shadow-lg">
                      ₹{((r.deliveryPrice ?? 0) / 100).toFixed(0)} OFF
                    </span>
                    <span className="block text-white/90 text-xs font-medium">
                      ABOVE ₹199
                    </span>
                  </div>

                  {/* Veg badge */}
                  {r.isVeg && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                      <Leaf className="w-3 h-3" /> PURE VEG
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3.5">
                  <h3 className="font-bold text-gray-800 text-base truncate group-hover:text-orange-600 transition-colors">
                    {r.restaurantName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {r.rating && r.rating > 0 && (
                      <div
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-white text-xs font-bold ${
                          r.rating >= 4
                            ? "bg-green-600"
                            : r.rating >= 3
                              ? "bg-yellow-500"
                              : "bg-orange-500"
                        }`}
                      >
                        <Star className="w-3 h-3 fill-current" />
                        {r.rating.toFixed(1)}
                      </div>
                    )}
                    <span className="text-gray-500 text-xs">
                      • {r.estimatedDeliveryTime} mins
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1.5 truncate">
                    {r.cuisines?.slice(0, 3).join(", ")}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {r.city}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="border-t border-gray-200" />

      {/* ─── Best restaurants near you (Swiggy grid) ─── */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Restaurants with online food delivery
        </h2>

        {/* Filter chips - Swiggy style */}
        <div className="flex gap-3 flex-wrap mb-6">
          {["Ratings 4.0+", "Pure Veg", "Fast Delivery", "Offers", "₹300-₹600"].map(
            (f) => (
              <button
                key={f}
                onClick={() => {
                  if (f === "Pure Veg") navigate("/search/all?isVeg=true");
                  else if (f === "Ratings 4.0+") navigate("/search/all?minRating=4");
                  else navigate("/search/all");
                }}
                className="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all whitespace-nowrap"
              >
                {f}
              </button>
            )
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : (
            restaurants.map((r) => (
              <div
                key={r._id}
                onClick={() => navigate(`/detail/${r._id}`)}
                className="bg-white rounded-2xl overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={r.imageUrl}
                    alt={r.restaurantName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 text-white text-sm font-extrabold drop-shadow">
                    FLAT ₹{((r.deliveryPrice ?? 0) / 100).toFixed(0)} OFF
                  </div>

                  {r.isVeg && (
                    <div className="absolute top-2 right-2 w-5 h-5 border-2 border-green-600 rounded-sm flex items-center justify-center bg-white">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 text-[15px] truncate flex-1">
                      {r.restaurantName}
                    </h3>
                    {r.rating && r.rating > 0 && (
                      <div
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-white text-xs font-bold shrink-0 ml-2 ${
                          r.rating >= 4
                            ? "bg-green-600"
                            : r.rating >= 3
                              ? "bg-yellow-500"
                              : "bg-orange-500"
                        }`}
                      >
                        <Star className="w-3 h-3 fill-current" />
                        {r.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                    <span className="truncate">
                      {r.cuisines?.slice(0, 2).join(", ")}
                    </span>
                    <span className="shrink-0 ml-2 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {r.estimatedDeliveryTime} mins
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="border-t border-gray-200" />

      {/* ─── Why Dhaba? (Swiggy style features strip) ─── */}
      <section className="py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Average delivery in 30 mins", color: "text-yellow-500" },
            { icon: Utensils, title: "500+ Restaurants", desc: "From local favourites to top chains", color: "text-orange-500" },
            { icon: Shield, title: "Safe & Hygienic", desc: "Best in class safety measures", color: "text-green-500" },
            { icon: TrendingUp, title: "Live Tracking", desc: "Track your order in real-time", color: "text-blue-500" },
          ].map((feat) => (
            <div key={feat.title} className="flex flex-col items-center text-center gap-3 p-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <feat.icon className={`w-7 h-7 ${feat.color}`} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">{feat.title}</h3>
              <p className="text-xs text-gray-400">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
