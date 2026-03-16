import { useQuery, useMutation, useQueryClient } from "react-query";
import * as DeliveryApi from "@/api/DeliveryApi";
import { useState, useCallback } from "react";
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  IndianRupee,
  AlertCircle,
  Bell,
  X,
} from "lucide-react";
import { useSocketEvent, getSocket } from "@/lib/socket";
import type { Order } from "@/types";

// Join the delivery room on mount so Socket.IO delivers events
const socket = getSocket();
socket.emit("join-delivery");

const STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  inProgress: "In Progress",
  outForDelivery: "Out for Delivery",
  delivered: "Delivered",
};

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-blue-100 text-blue-800",
  inProgress: "bg-yellow-100 text-yellow-800",
  outForDelivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
};

const DeliveryDashboardPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dismissedOrders, setDismissedOrders] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<
    { orderId: string; customerName: string; address: string; restaurantName: string; time: number }[]
  >([]);
  const queryClient = useQueryClient();

  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError: ordersError,
  } = useQuery(["deliveryOrders", statusFilter], () =>
    DeliveryApi.getDeliveryOrders(statusFilter !== "all" ? statusFilter : undefined)
  );

  const { data: stats } = useQuery("deliveryStats", DeliveryApi.getDeliveryStats);

  const { mutate: updateStatus, isLoading: updatingStatus } = useMutation(
    ({ orderId, status }: { orderId: string; status: string }) =>
      DeliveryApi.updateDeliveryStatus(orderId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("deliveryOrders");
        queryClient.invalidateQueries("deliveryStats");
      },
    }
  );

  // Listen for new delivery order notifications in real-time
  useSocketEvent("new-delivery-order", useCallback((data: { orderId: string; order: Order }) => {
    const order = data.order;
    if (!order) return;
    const restaurantName =
      typeof order.restaurant === "object"
        ? order.restaurant.restaurantName
        : "Restaurant";
    setNotifications((prev) => [
      {
        orderId: data.orderId,
        customerName: order.deliveryDetails?.name || "Customer",
        address: `${order.deliveryDetails?.addressLine1 || ""}, ${order.deliveryDetails?.city || ""}`,
        restaurantName,
        time: Date.now(),
      },
      ...prev,
    ]);
    // Also refetch the orders list
    queryClient.invalidateQueries("deliveryOrders");
    queryClient.invalidateQueries("deliveryStats");
  }, [queryClient]));

  const dismissNotification = (orderId: string) => {
    setNotifications((prev) => prev.filter((n) => n.orderId !== orderId));
  };

  const dismissOrder = (orderId: string) => {
    setDismissedOrders((prev) => new Set(prev).add(orderId));
  };

  // Filter out dismissed orders from the visible list
  const visibleOrders = orders.filter((o) => !dismissedOrders.has(o._id));

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
  };

  if (ordersLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Real-time New Order Notification Banner */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.orderId}
              className="flex items-center justify-between gap-4 bg-orange-50 border border-orange-300 rounded-xl px-5 py-3 shadow-md animate-bounce-once"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-orange-600 animate-pulse" />
                <div>
                  <p className="font-semibold text-orange-800">
                    New Order!
                  </p>
                  <p className="text-sm text-orange-700">
                    <span className="font-medium">{n.customerName}</span> ordered from{" "}
                    <span className="font-medium">{n.restaurantName}</span> &mdash;
                    Deliver to: {n.address}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissNotification(n.orderId)}
                className="p-1 rounded-full hover:bg-orange-200 transition-colors"
              >
                <X className="h-4 w-4 text-orange-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Truck className="h-8 w-8 text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Delivery Dashboard</h1>
          <p className="text-gray-500">Manage your delivery assignments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Truck className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Out for Delivery</p>
              <p className="text-2xl font-bold">{stats?.outForDelivery ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivered Today</p>
              <p className="text-2xl font-bold">{stats?.deliveredToday ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Pickup</p>
              <p className="text-2xl font-bold">{stats?.totalPending ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Filter:</span>
          {["all", "paid", "inProgress", "outForDelivery", "delivered"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s === "all" ? "All Orders" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {ordersError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-700">Failed to load delivery orders. Please try again.</p>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No orders found</h3>
          <p className="text-gray-500">
            {statusFilter === "all"
              ? "There are no delivery orders at the moment."
              : `No orders with status "${STATUS_LABELS[statusFilter]}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <span className="text-sm font-mono text-gray-500">
                  #{order._id.slice(-6).toUpperCase()}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  {/* Dismiss / Ignore order button */}
                  {(order.status === "paid" || order.status === "inProgress") && (
                    <button
                      onClick={() => dismissOrder(order._id)}
                      title="Ignore this order"
                      className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="p-4 space-y-3">
                {/* Customer */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{order.deliveryDetails.name}</span>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span>
                    {order.deliveryDetails.addressLine1}, {order.deliveryDetails.city}
                  </span>
                </div>

                {/* Restaurant */}
                {order.restaurant && (
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span>
                      From:{" "}
                      <span className="font-medium">
                        {typeof order.restaurant === "object"
                          ? order.restaurant.restaurantName
                          : "Restaurant"}
                      </span>
                    </span>
                  </div>
                )}

                {/* Time */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{new Date(order.createdAt).toLocaleString("en-IN")}</span>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-2 text-sm">
                  <IndianRupee className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold">
                    {formatCurrency(order.totalAmount ?? 0)}
                  </span>
                </div>

                {/* Items */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-1">
                    {order.cartItems.length} item{order.cartItems.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {order.cartItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs"
                      >
                        <span className="font-medium">{item.quantity}×</span> {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t bg-gray-50">
                {order.status === "paid" || order.status === "inProgress" ? (
                  <button
                    onClick={() =>
                      updateStatus({ orderId: order._id, status: "outForDelivery" })
                    }
                    disabled={updatingStatus}
                    className="w-full py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                  >
                    <Truck className="inline h-4 w-4 mr-2" />
                    Pick Up for Delivery
                  </button>
                ) : order.status === "outForDelivery" ? (
                  <button
                    onClick={() =>
                      updateStatus({ orderId: order._id, status: "delivered" })
                    }
                    disabled={updatingStatus}
                    className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle2 className="inline h-4 w-4 mr-2" />
                    Mark as Delivered
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Delivered</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboardPage;
