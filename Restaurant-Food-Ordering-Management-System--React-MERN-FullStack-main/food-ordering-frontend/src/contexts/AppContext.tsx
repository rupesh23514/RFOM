import React from "react";
import { useQuery } from "react-query";
import * as authApi from "@/api/authApi";
import type { UserRole } from "@/types";

type AppContextType = {
  isLoggedIn: boolean;
  userRole: UserRole;
  showToast?: (opts: { title: string; description?: string; type?: string }) => void;
};

export const AppContext = React.createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const checkStoredAuth = () =>
    !!localStorage.getItem("session_id") && !!localStorage.getItem("user_id");

  const hasStoredToken = !!localStorage.getItem("session_id") && !!localStorage.getItem("user_id");
  const { isError, isLoading, data } = useQuery("validateToken", authApi.validateToken, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: hasStoredToken,
  });

  // Logged in when: validation succeeded, OR we have token and validation failed (e.g. network), OR we have token and still loading (e.g. returning from Stripe redirect)
  const isLoggedIn =
    (!isLoading && !isError && !!data) ||
    (hasStoredToken && isError) ||
    (hasStoredToken && isLoading);

  // Determine role: from validation response, or from localStorage fallback, or default to "customer"
  const userRole: UserRole =
    data?.role ||
    (localStorage.getItem("user_role") as UserRole) ||
    "customer";

  return (
    <AppContext.Provider value={{ isLoggedIn, userRole }}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppContextProvider");
  return ctx;
};
