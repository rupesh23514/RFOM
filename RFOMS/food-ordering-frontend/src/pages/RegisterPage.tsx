import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { axiosInstance } from "@/lib/api-client";
import { toast } from "sonner";
import type { UserRole } from "@/types";

type FormData = { email: string; password: string; name: string; role: UserRole };

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: "customer", label: "Customer", description: "Browse & order food" },
  { value: "restaurant_owner", label: "Restaurant Owner", description: "Manage your restaurant" },
  { value: "delivery", label: "Delivery Partner", description: "Deliver orders" },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { role: "customer" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post("/api/auth/register", data);
      if (res.data?.token) {
        localStorage.setItem("session_id", res.data.token);
        localStorage.setItem("user_id", res.data.userId);
        if (res.data.role) localStorage.setItem("user_role", res.data.role);
        if (res.data.user?.email) localStorage.setItem("user_email", res.data.user.email);
        if (res.data.user?.name) localStorage.setItem("user_name", res.data.user.name);
        if (res.data.user?.role) localStorage.setItem("user_role", res.data.user.role);
      }
      toast.success("Account created! Signed in.");
      navigate("/");
      window.location.reload();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-center">Register</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name", { required: "Name is required" })} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email", { required: "Email is required" })} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password", { required: "Password is required", minLength: 6 })} />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label>I want to join as</Label>
            <div className="grid grid-cols-1 gap-2">
              {ROLE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedRole === opt.value
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register("role")}
                    className="accent-orange-500"
                  />
                  <div>
                    <div className="font-medium text-sm">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Register"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/sign-in" className="font-medium text-orange-500 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
