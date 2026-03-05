import { useState } from "react";
import type { MenuItem } from "../types";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, Check, ShoppingCart, Star, Flame } from "lucide-react";
import { getFoodImage } from "@/config/food-images";

type Props = {
  menuItem: MenuItem;
  addToCart: () => void;
  quantity?: number;
};

const SPICE_MAP: Record<string, string> = {
  mild: "🌶",
  medium: "🌶🌶",
  hot: "🌶🌶🌶",
  "extra-hot": "🌶🌶🌶🌶",
};

const MenuItem = ({ menuItem, addToCart, quantity = 0 }: Props) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const imageUrl = menuItem.imageUrl || getFoodImage(menuItem.name);
  const isVeg = menuItem.isVeg !== false; // default true

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <Card className="group overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-row gap-0">
        {/* Food Image */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 overflow-hidden">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-50 animate-pulse" />
          )}
          <img
            src={imageUrl}
            alt={menuItem.name}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
          {quantity > 0 && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
              {quantity}
            </div>
          )}
          {/* Popular badge */}
          {menuItem.isPopular && (
            <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-white" /> Popular
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            {/* Veg/Non-Veg indicator + Name */}
            <div className="flex items-start gap-2">
              <span
                className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center shrink-0 mt-0.5 ${
                  isVeg ? "border-green-600" : "border-red-600"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isVeg ? "bg-green-600" : "bg-red-600"
                  }`}
                />
              </span>
              <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-orange-600 transition-colors">
                {menuItem.name}
              </h3>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
              {menuItem.description || "Fresh & delicious"}
            </p>

            {/* Spice + Category */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {menuItem.spiceLevel && menuItem.spiceLevel !== "medium" && (
                <span className="text-xs">
                  {SPICE_MAP[menuItem.spiceLevel] || "🌶🌶"}
                </span>
              )}
              {menuItem.category && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {menuItem.category}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xl font-bold text-orange-600">
              ₹{(menuItem.price / 100).toFixed(2)}
            </span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className={`rounded-full px-4 transition-all duration-300 ${
                justAdded
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-orange-500 hover:bg-orange-600"
              } text-white shadow-md hover:shadow-lg`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Added
                </>
              ) : quantity > 0 ? (
                <>
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Add More
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MenuItem;
