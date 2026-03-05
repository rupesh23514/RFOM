import { Restaurant } from "@/types";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem("session_id");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useGetFavorites = () => {
  return useQuery<Restaurant[]>(
    "favorites",
    async () => {
      const res = await axios.get(`${API_BASE_URL}/api/favorites`, {
        headers: getAuthHeader(),
      });
      return res.data;
    },
    {
      enabled: !!localStorage.getItem("session_id"),
    }
  );
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (restaurantId: string) => {
      const res = await axios.post(
        `${API_BASE_URL}/api/favorites/${restaurantId}`,
        {},
        { headers: getAuthHeader() }
      );
      return res.data as { isFavorite: boolean; restaurantId: string };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("favorites");
        queryClient.invalidateQueries("checkFavorite");
      },
    }
  );
};

export const useCheckFavorite = (restaurantId?: string) => {
  return useQuery(
    ["checkFavorite", restaurantId],
    async () => {
      const res = await axios.get(
        `${API_BASE_URL}/api/favorites/${restaurantId}/check`,
        { headers: getAuthHeader() }
      );
      return res.data.isFavorite as boolean;
    },
    {
      enabled: !!restaurantId && !!localStorage.getItem("session_id"),
    }
  );
};
