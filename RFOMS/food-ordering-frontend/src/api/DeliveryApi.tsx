import { axiosInstance } from "@/lib/api-client";
import type { Order } from "@/types";

export const getDeliveryOrders = async (status?: string): Promise<Order[]> => {
  const params = status ? { status } : {};
  const res = await axiosInstance.get("/api/delivery/orders", { params });
  return res.data;
};

export const getDeliveryStats = async (): Promise<{
  outForDelivery: number;
  deliveredToday: number;
  totalPending: number;
}> => {
  const res = await axiosInstance.get("/api/delivery/stats");
  return res.data;
};

export const updateDeliveryStatus = async (
  orderId: string,
  status: string
): Promise<Order> => {
  const res = await axiosInstance.patch(`/api/delivery/orders/${orderId}/status`, {
    status,
  });
  return res.data;
};
