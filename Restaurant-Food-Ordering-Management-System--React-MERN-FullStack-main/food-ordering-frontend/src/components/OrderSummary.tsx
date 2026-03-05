import { CartItem } from "@/pages/DetailPage";
import { Restaurant } from "@/types";
import { CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import {
  Trash2,
  CreditCard,
  AlertCircle,
  Copy,
  Check,
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  Receipt,
} from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { getFoodImage } from "@/config/food-images";

type Props = {
  restaurant: Restaurant;
  cartItems: CartItem[];
  removeFromCart: (cartItem: CartItem) => void;
  updateCartItemQuantity?: (cartItem: CartItem, newQuantity: number) => void;
};

const OrderSummary = ({
  restaurant,
  cartItems,
  removeFromCart,
  updateCartItemQuantity,
}: Props) => {
  const [isCopied, setIsCopied] = useState(false);

  const subtotalPence = cartItems.reduce(
    (total, cartItem) => total + cartItem.price * cartItem.quantity,
    0
  );
  const totalPence =
    cartItems.length > 0 ? subtotalPence + restaurant.deliveryPrice : 0;

  const formatCurrency = (pence: number) =>
    `₹${(pence / 100).toFixed(2)}`;

  const copyCredentials = async () => {
    const credentials = `Email: test@example.com
Card: 4242 4242 4242 4242
Expiry: 12/35
CVC: 123
Name: John Doe`;

    try {
      await navigator.clipboard.writeText(credentials);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy credentials:", err);
    }
  };

  return (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xl font-bold">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            Your Order
          </span>
          {cartItems.length > 0 && (
            <span className="text-lg font-bold text-orange-600">
              {formatCurrency(totalPence)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8 text-orange-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              Your cart is empty
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Add items from the menu to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-3 p-2 rounded-xl bg-gray-50/80 hover:bg-orange-50/50 transition-colors"
              >
                {/* Tiny food image thumbnail */}
                <img
                  src={getFoodImage(item.name)}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />

                {/* Item details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatCurrency(item.price)} each
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1">
                  <button
                    className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-orange-300 hover:bg-orange-50 transition-colors disabled:opacity-40"
                    disabled={item.quantity <= 1}
                    onClick={() =>
                      updateCartItemQuantity &&
                      updateCartItemQuantity(item, item.quantity - 1)
                    }
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <span className="w-7 text-center text-sm font-bold select-none">
                    {item.quantity}
                  </span>
                  <button
                    className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-orange-300 hover:bg-orange-50 transition-colors"
                    onClick={() =>
                      updateCartItemQuantity &&
                      updateCartItemQuantity(item, item.quantity + 1)
                    }
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                </div>

                {/* Price & Remove */}
                <div className="flex items-center gap-2 ml-1">
                  <span className="text-sm font-bold text-gray-800 min-w-[60px] text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" />
              Subtotal
            </span>
            <span>{formatCurrency(subtotalPence)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              Delivery
            </span>
            <span>{formatCurrency(restaurant.deliveryPrice)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-orange-600">{formatCurrency(totalPence)}</span>
          </div>
        </div>

        {/* Test Credentials Notice */}
        {cartItems.length > 0 && (
          <div className="border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-3 mt-1">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 w-full">
                <p className="font-semibold text-xs text-amber-800">
                  Test Credentials for Payment:
                </p>
                <div className="relative text-xs space-y-1 bg-white/70 p-2 rounded-lg border border-amber-100">
                  <button
                    onClick={copyCredentials}
                    className="absolute top-1 right-1 p-1 hover:bg-amber-50 rounded transition-colors"
                    title={isCopied ? "Copied!" : "Copy all credentials"}
                  >
                    {isCopied ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3 text-amber-600 hover:text-amber-800" />
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <CreditCard className="h-3 w-3 text-amber-500" />
                    <span className="font-medium">Card:</span>
                    <code className="bg-amber-50 px-1 rounded text-xs">
                      4242 4242 4242 4242
                    </code>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="h-3 w-3 text-amber-500" />
                    <span className="font-medium">Expiry:</span>
                    <code className="bg-amber-50 px-1 rounded text-xs">12/35</code>
                    <span className="font-medium ml-1">CVC:</span>
                    <code className="bg-amber-50 px-1 rounded text-xs">123</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </>
  );
};

export default OrderSummary;

