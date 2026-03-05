import { Restaurant } from "@/types";
import { Link } from "react-router-dom";
import { AspectRatio } from "./ui/aspect-ratio";
import { Banknote, Clock, MapPin, Star, Utensils, ArrowRight, Leaf } from "lucide-react";

type Props = {
  restaurant: Restaurant;
};

const SearchResultCard = ({ restaurant }: Props) => {
  const rating = restaurant.rating && restaurant.rating > 0 ? restaurant.rating : null;
  const totalRatings = restaurant.totalRatings || 0;

  return (
    <Link
      to={`/detail/${restaurant._id}`}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-orange-200"
    >
      <div className="grid lg:grid-cols-[2fr_3fr]">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <AspectRatio ratio={16 / 10}>
            <img
              src={restaurant.imageUrl}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt={restaurant.restaurantName}
              loading="lazy"
            />
          </AspectRatio>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {/* Location badge */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-gray-700 flex items-center gap-1 shadow-sm">
            <MapPin className="w-3 h-3 text-orange-500" />
            {restaurant.city}
          </div>
          {/* Rating badge */}
          {rating && (
            <div className={`absolute top-3 right-3 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 ${
              rating >= 4 ? "bg-green-600/90" : rating >= 3 ? "bg-yellow-500/90" : "bg-orange-500/90"
            }`}>
              <Star className="w-3 h-3 fill-white" />
              {rating.toFixed(1)}
              {totalRatings > 0 && (
                <span className="text-white/80 font-normal ml-0.5">({totalRatings})</span>
              )}
            </div>
          )}
          {/* Veg badge */}
          {restaurant.isVeg && (
            <div className="absolute bottom-3 left-3 bg-green-600/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Pure Veg
            </div>
          )}
          {/* Offers badge */}
          {restaurant.offers && restaurant.offers.length > 0 && (
            <div className="absolute bottom-3 right-3 bg-blue-600/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-white">
              {restaurant.offers[0].discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-orange-600 transition-colors">
                {restaurant.restaurantName}
              </h3>
              {restaurant.isVeg && (
                <span className="w-5 h-5 border-2 border-green-600 rounded-sm flex items-center justify-center shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
                </span>
              )}
            </div>

            {/* Cuisine Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {restaurant.cuisines.slice(0, 4).map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-medium border border-orange-100"
                >
                  {item}
                </span>
              ))}
              {restaurant.cuisines.length > 4 && (
                <span className="text-xs text-gray-400 px-1.5 py-1">
                  +{restaurant.cuisines.length - 4} more
                </span>
              )}
            </div>

            {/* Tags */}
            {restaurant.tags && restaurant.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {restaurant.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Avg cost + Menu count */}
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
              {restaurant.avgCostForTwo && restaurant.avgCostForTwo > 0 && (
                <span className="flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-gray-400" />
                  ₹{(restaurant.avgCostForTwo / 100).toFixed(0)} for two
                </span>
              )}
              {restaurant.menuItems.length > 0 && (
                <span className="flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-gray-400" />
                  {restaurant.menuItems.length} items
                </span>
              )}
            </div>
          </div>

          {/* Footer stats */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 font-medium">
                  {restaurant.estimatedDeliveryTime} mins
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Banknote className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  ₹{(restaurant.deliveryPrice / 100).toFixed(0)} delivery
                </span>
              </div>
              {restaurant.isOpen === false && (
                <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                  Closed
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 text-orange-500 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              View Menu <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SearchResultCard;
