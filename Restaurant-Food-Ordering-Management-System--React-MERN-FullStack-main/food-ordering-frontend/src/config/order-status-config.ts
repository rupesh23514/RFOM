import { OrderStatus } from "@/types";

type OrderStatusInfo = {
  label: string;
  value: OrderStatus;
  progressValue: number;
};

export const ORDER_STATUS: OrderStatusInfo[] = [
  { label: "Placed", value: "placed", progressValue: 0 },
  {
    label: "Awaiting Restaurant Confirmation",
    value: "paid",
    progressValue: 15,
  },
  { label: "Confirmed", value: "confirmed", progressValue: 30 },
  { label: "Preparing", value: "preparing", progressValue: 45 },
  { label: "In Progress", value: "inProgress", progressValue: 60 },
  { label: "Out for Delivery", value: "outForDelivery", progressValue: 80 },
  { label: "Delivered", value: "delivered", progressValue: 100 },
  { label: "Cancelled", value: "cancelled", progressValue: 0 },
];
