import { Order } from "@/types";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/api-client";
import { useSocketEvent } from "@/lib/socket";

export const useGetMyOrders = () => {
  const queryClient = useQueryClient();

  const getMyOrdersRequest = async (): Promise<Order[]> => {
    const res = await axiosInstance.get("/api/order");
    return res.data;
  };

  const { data: orders, isLoading } = useQuery(
    "fetchMyOrders",
    getMyOrdersRequest,
    {
      enabled: !!localStorage.getItem("session_id"),
      refetchInterval: 30000, // fallback polling every 30s (socket handles real-time)
    }
  );

  // Real-time: refetch when order status changes via Socket.IO
  const userId = localStorage.getItem("user_id") || undefined;
  useSocketEvent(
    "order-updated",
    () => {
      queryClient.invalidateQueries("fetchMyOrders");
    },
    { userId }
  );

  return { orders, isLoading };
};

type CheckoutSessionRequest = {
  cartItems: { menuItemId: string; name: string; quantity: string }[];
  deliveryDetails: { email: string; name: string; addressLine1: string; city: string };
  restaurantId: string;
};

export const useCreateCheckoutSession = () => {
  const createCheckoutSessionRequest = async (
    req: CheckoutSessionRequest
  ) => {
    const res = await axiosInstance.post(
      "/api/order/checkout/direct-order",
      req
    );
    return res.data;
  };

  const { mutateAsync: createCheckoutSession, isLoading, error, reset } =
    useMutation(createCheckoutSessionRequest);

  if (error) {
    toast.error((error as Error).toString());
    reset();
  }

  return { createCheckoutSession, isLoading };
};
