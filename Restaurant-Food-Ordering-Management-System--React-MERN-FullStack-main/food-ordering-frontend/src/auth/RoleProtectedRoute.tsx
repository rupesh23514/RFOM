import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { useEffect } from "react";
import type { UserRole } from "@/types";

type Props = {
  allowedRoles: UserRole[];
};

/**
 * Route guard that checks both authentication AND role.
 * Redirects unauthenticated users to /sign-in.
 * Shows a 403-style message for authenticated users without the required role.
 */
const RoleProtectedRoute = ({ allowedRoles }: Props) => {
  const { isLoggedIn, userRole } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/sign-in", { state: { from: location } });
    }
  }, [isLoggedIn, navigate, location]);

  if (!isLoggedIn) return null;

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">403</h1>
          <p className="text-lg text-gray-600">
            You don&apos;t have permission to access this page.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
