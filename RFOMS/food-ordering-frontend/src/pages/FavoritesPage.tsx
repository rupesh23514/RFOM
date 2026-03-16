import { useGetFavorites, useToggleFavorite } from "@/api/FavoriteApi";
import { Link } from "react-router-dom";
import {
  Heart,
  MapPin,
  Clock,
  Star,
  Leaf,
  Banknote,
  Loader2,
  HeartOff,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const FavoritesPage = () => {
  const { data: favorites, isLoading } = useGetFavorites();
  const { mutate: toggleFavorite } = useToggleFavorite();

  const handleRemoveFavorite = (restaurantId: string, name: string) => {
    toggleFavorite(restaurantId, {
      onSuccess: () => {
        toast.success(`Removed ${name} from favorites`);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <HeartOff className="h-16 w-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-700">No Favorites Yet</h2>
        <p className="text-gray-500 text-center max-w-md">
          Explore restaurants and tap the heart icon to save your favorites for
          quick access.
        </p>
        <Link to="/search/all">
          <Button className="bg-orange-500 hover:bg-orange-600 mt-2">
            Explore Restaurants
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Heart className="h-7 w-7 text-red-500 fill-red-500" />
          My Favorites
        </h1>
        <p className="text-muted-foreground">
          {favorites.length} {favorites.length === 1 ? "restaurant" : "restaurants"} saved
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((restaurant) => (
          <Card
            key={restaurant._id}
            className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-gray-100"
          >
            <Link to={`/detail/${restaurant._id}`}>
              <div className="relative h-44 overflow-hidden">
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.restaurantName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {/* Rating */}
                {restaurant.rating && restaurant.rating > 0 && (
                  <div
                    className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-white text-sm font-bold flex items-center gap-1 ${
                      restaurant.rating >= 4
                        ? "bg-green-600"
                        : restaurant.rating >= 3
                          ? "bg-yellow-500"
                          : "bg-orange-500"
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    {restaurant.rating.toFixed(1)}
                  </div>
                )}
                {/* Veg badge */}
                {restaurant.isVeg && (
                  <div className="absolute top-3 right-12 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                    <Leaf className="w-3 h-3" /> Pure Veg
                  </div>
                )}
                {/* City badge */}
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-orange-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {restaurant.city}
                </div>
              </div>
            </Link>

            <div className="p-4">
              <div className="flex items-start justify-between">
                <Link
                  to={`/detail/${restaurant._id}`}
                  className="flex-1 hover:text-orange-600 transition-colors"
                >
                  <h3 className="text-lg font-bold text-gray-900">
                    {restaurant.restaurantName}
                  </h3>
                </Link>
                <button
                  onClick={() =>
                    handleRemoveFavorite(restaurant._id, restaurant.restaurantName)
                  }
                  className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
                  title="Remove from favorites"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {restaurant.cuisines.slice(0, 3).map((cuisine) => (
                  <span
                    key={cuisine}
                    className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-medium"
                  >
                    {cuisine}
                  </span>
                ))}
                {restaurant.cuisines.length > 3 && (
                  <span className="text-xs text-gray-400 px-1">
                    +{restaurant.cuisines.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 border-t mt-3 pt-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-green-600" />
                  {restaurant.estimatedDeliveryTime} mins
                </span>
                <span className="flex items-center gap-1">
                  <Banknote className="w-4 h-4" />₹
                  {(restaurant.deliveryPrice / 100).toFixed(0)} delivery
                </span>
                {restaurant.avgCostForTwo && (
                  <span className="text-xs text-gray-400">
                    ₹{(restaurant.avgCostForTwo / 100).toFixed(0)} for two
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
