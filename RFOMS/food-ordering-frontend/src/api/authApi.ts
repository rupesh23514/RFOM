import { axiosInstance } from "@/lib/api-client";

export const signIn = async (data: { email: string; password: string }) => {
  const res = await axiosInstance.post("/api/auth/login", data);
  const token = res.data?.token;
  if (token) localStorage.setItem("session_id", token);
  if (res.data?.userId) localStorage.setItem("user_id", res.data.userId);
  if (res.data?.role) localStorage.setItem("user_role", res.data.role);
  if (res.data?.user) {
    const { email, name, role } = res.data.user;
    if (email) localStorage.setItem("user_email", email);
    if (name) localStorage.setItem("user_name", name);
    if (role) localStorage.setItem("user_role", role);
  }
  return res.data;
};

export const validateToken = async () => {
  const res = await axiosInstance.get("/api/auth/validate-token");
  // Persist role from validate response
  if (res.data?.role) localStorage.setItem("user_role", res.data.role);
  return res.data;
};

export const signOut = async () => {
  await axiosInstance.post("/api/auth/logout");
  ["session_id", "user_id", "user_email", "user_name", "user_image", "user_role"].forEach((k) =>
    localStorage.removeItem(k)
  );
};
