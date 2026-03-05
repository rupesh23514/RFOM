import { Review } from "@/types";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem("session_id");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

type ReviewsResponse = {
  reviews: Review[];
  pagination: { total: number; page: number; pages: number };
  breakdown: Record<number, number>;
};

export const useGetRestaurantReviews = (
  restaurantId?: string,
  page = 1,
  sortBy = "recent"
) => {
  const fetchReviews = async (): Promise<ReviewsResponse> => {
    const res = await axios.get(
      `${API_BASE_URL}/api/reviews/restaurant/${restaurantId}?page=${page}&sortBy=${sortBy}`
    );
    return res.data;
  };

  return useQuery(
    ["restaurantReviews", restaurantId, page, sortBy],
    fetchReviews,
    { enabled: !!restaurantId }
  );
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (data: {
      orderId: string;
      rating: number;
      comment?: string;
      foodRating?: number;
      deliveryRating?: number;
      packagingRating?: number;
    }) => {
      const res = await axios.post(`${API_BASE_URL}/api/reviews`, data, {
        headers: getAuthHeader(),
      });
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("restaurantReviews");
        queryClient.invalidateQueries("fetchMyOrders");
      },
    }
  );
};

export const useReplyToReview = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (data: { reviewId: string; reply: string }) => {
      const res = await axios.post(
        `${API_BASE_URL}/api/reviews/${data.reviewId}/reply`,
        { reply: data.reply },
        { headers: getAuthHeader() }
      );
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("restaurantReviews");
      },
    }
  );
};
