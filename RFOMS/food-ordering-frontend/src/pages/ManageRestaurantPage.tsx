import { useMemo } from "react";
import {
  useCreateMyRestaurant,
  useGetMyRestaurant,
  useGetMyRestaurantOrders,
  useUpdateMyRestaurant,
} from "@/api/MyRestaurantApi";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ManageRestaurantForm from "@/forms/manage-restaurant-form/ManageRestaurantForm";
import EnhancedOrdersTab from "@/components/EnhancedOrdersTab";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  ShoppingCart,
  IndianRupee,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useQueryClient } from "react-query";

const ManageRestaurantPage = () => {
  const { createRestaurant, isLoading: isCreateLoading } =
    useCreateMyRestaurant();
  const { restaurant } = useGetMyRestaurant();
  const { updateRestaurant, isLoading: isUpdateLoading } =
    useUpdateMyRestaurant();

  const {
    orders,
    isLoading: ordersLoading,
    isFetching: ordersFetching,
    refetch,
  } = useGetMyRestaurantOrders(!!restaurant, restaurant?._id);
  const queryClient = useQueryClient();

  const isEditing = !!restaurant;

  const visibleStatuses = ["paid", "inProgress", "outForDelivery", "delivered"];
  const visibleOrders = orders?.filter((order) =>
    visibleStatuses.includes(order.status)
  );
  const placedOrders = orders?.filter((order) => order.status === "placed");

  // Compute order analytics from the existing orders data (updates in real-time via Socket.IO)
  const analytics = useMemo(() => {
    const allOrders = orders ?? [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysOrders = allOrders.filter(
      (o) => new Date(o.createdAt) >= today
    );
    const activeOrders = allOrders.filter((o) =>
      ["paid", "inProgress", "outForDelivery"].includes(o.status)
    );
    const completedOrders = allOrders.filter((o) => o.status === "delivered");
    const totalRevenue = allOrders
      .filter((o) =>
        ["paid", "inProgress", "outForDelivery", "delivered"].includes(o.status)
      )
      .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

    return {
      totalOrders: allOrders.length,
      todaysOrders: todaysOrders.length,
      activeOrders: activeOrders.length,
      completedOrders: completedOrders.length,
      totalRevenue,
    };
  }, [orders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount / 100);
  };

  const handleRefreshOrders = () => {
    queryClient.invalidateQueries("fetchMyRestaurantOrders");
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Restaurant</h1>
        <Button
          onClick={handleRefreshOrders}
          disabled={ordersLoading || ordersFetching}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${ordersFetching ? "animate-spin" : ""}`}
          />
          Refresh Orders
        </Button>
      </div>

      {/* Order Analytics Cards - updates in real-time when customers place orders */}
      {restaurant && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.todaysOrders}</div>
              <p className="text-xs text-muted-foreground">Orders placed today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeOrders}</div>
              <p className="text-xs text-muted-foreground">In progress right now</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.completedOrders} delivered
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="placed-orders">
            Orders Placed but Not Paid
          </TabsTrigger>
          <TabsTrigger value="manage-restaurant">Manage Restaurant</TabsTrigger>
        </TabsList>
        <TabsContent
          value="orders"
          className="space-y-5 bg-gray-50 p-10 rounded-lg"
        >
          {ordersLoading ? (
            <div className="text-center py-8">
              <div className="text-lg font-medium">Loading orders...</div>
            </div>
          ) : (
            <EnhancedOrdersTab
              orders={visibleOrders || []}
              showStatusSelector={true}
            />
          )}
        </TabsContent>
        <TabsContent
          value="placed-orders"
          className="space-y-5 bg-gray-50 p-10 rounded-lg"
        >
          {ordersLoading ? (
            <div className="text-center py-8">
              <div className="text-lg font-medium">Loading orders...</div>
            </div>
          ) : (
            <EnhancedOrdersTab
              orders={placedOrders || []}
              showStatusSelector={false}
            />
          )}
        </TabsContent>
        <TabsContent value="manage-restaurant">
          <ManageRestaurantForm
            restaurant={restaurant}
            onSave={isEditing ? updateRestaurant : createRestaurant}
            isLoading={isCreateLoading || isUpdateLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageRestaurantPage;
