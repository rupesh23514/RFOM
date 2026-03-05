import { Order, StatusHistoryEntry } from "@/types";
import {
  CheckCircle,
  Circle,
  CreditCard,
  ChefHat,
  Truck,
  Package,
  XCircle,
  Clock,
  ThumbsUp,
} from "lucide-react";

type Props = {
  order: Order;
};

const STATUS_META: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  placed: { label: "Order Placed", icon: Package, color: "text-gray-500" },
  paid: { label: "Payment Confirmed", icon: CreditCard, color: "text-blue-500" },
  confirmed: { label: "Restaurant Confirmed", icon: ThumbsUp, color: "text-indigo-500" },
  preparing: { label: "Preparing Your Food", icon: ChefHat, color: "text-yellow-600" },
  inProgress: { label: "Being Prepared", icon: ChefHat, color: "text-yellow-600" },
  outForDelivery: { label: "Out for Delivery", icon: Truck, color: "text-orange-500" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "text-green-600" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-500" },
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const OrderTimeline = ({ order }: Props) => {
  const history: StatusHistoryEntry[] = order.statusHistory ?? [];

  // If no status history, build a minimal one from current status
  const timeline: StatusHistoryEntry[] =
    history.length > 0
      ? history
      : [{ status: order.status, timestamp: order.createdAt }];

  const isCancelled = order.status === "cancelled";

  return (
    <div className="relative pl-6 space-y-0">
      {timeline.map((entry, idx) => {
        const meta = STATUS_META[entry.status] || {
          label: entry.status,
          icon: Circle,
          color: "text-gray-400",
        };
        const Icon = meta.icon;
        const isLast = idx === timeline.length - 1;
        const isCancelledEntry = entry.status === "cancelled";

        return (
          <div key={idx} className="relative pb-6 last:pb-0">
            {/* Connecting line */}
            {!isLast && (
              <div
                className={`absolute left-[-13px] top-7 w-0.5 h-full ${
                  isCancelledEntry ? "bg-red-200" : "bg-green-300"
                }`}
              />
            )}

            {/* Icon dot */}
            <div
              className={`absolute left-[-20px] top-1 flex items-center justify-center w-6 h-6 rounded-full ${
                isCancelledEntry
                  ? "bg-red-100"
                  : isLast
                    ? "bg-green-100 ring-2 ring-green-400"
                    : "bg-green-100"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isCancelledEntry ? "text-red-500" : meta.color
                }`}
              />
            </div>

            {/* Content */}
            <div className="ml-2">
              <p
                className={`text-sm font-semibold ${
                  isCancelledEntry
                    ? "text-red-600"
                    : isLast
                      ? "text-green-700"
                      : "text-gray-700"
                }`}
              >
                {meta.label}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {formatTime(entry.timestamp)}
              </p>
              {entry.note && (
                <p className="text-xs text-gray-500 mt-1 italic">
                  {entry.note}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Estimated delivery info */}
      {!isCancelled && order.status !== "delivered" && order.estimatedDeliveryTime && (
        <div className="relative pb-0">
          <div className="absolute left-[-20px] top-1 flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border-2 border-dashed border-gray-300">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium text-gray-400">
              Estimated Delivery
            </p>
            <p className="text-xs text-gray-400">
              {new Date(order.estimatedDeliveryTime).toLocaleString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
