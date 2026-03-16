import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./layouts/layout";
import HomePage from "./pages/HomePage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import SignInPage from "./pages/SignInPage";
import RegisterPage from "./pages/RegisterPage";
import UserProfilePage from "./pages/UserProfilePage";
import ProtectedRoute from "./auth/ProtectedRoute";
import RoleProtectedRoute from "./auth/RoleProtectedRoute";
import ManageRestaurantPage from "./pages/ManageRestaurantPage";
import SearchPage from "./pages/SearchPage";
import DetailPage from "./pages/DetailPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import FavoritesPage from "./pages/FavoritesPage";
import AnalyticsDashboardPage from "./pages/AnalyticsDashboardPage";
import DeliveryDashboardPage from "./pages/DeliveryDashboardPage";
import PaymentPage from "./pages/PaymentPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes - Customer facing */}
      <Route
        path="/"
        element={
          <Layout showHero>
            <HomePage />
          </Layout>
        }
      />
      <Route
        path="/sign-in"
        element={
          <Layout showHero={false}>
            <SignInPage />
          </Layout>
        }
      />
      <Route
        path="/register"
        element={
          <Layout showHero={false}>
            <RegisterPage />
          </Layout>
        }
      />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route
        path="/search/:city"
        element={
          <Layout showHero={false}>
            <SearchPage />
          </Layout>
        }
      />
      <Route
        path="/detail/:restaurantId"
        element={
          <Layout showHero={false}>
            <DetailPage />
          </Layout>
        }
      />

      {/* Protected routes - Any logged in user */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/user-profile"
          element={
            <Layout>
              <UserProfilePage />
            </Layout>
          }
        />
      </Route>

      {/* Customer routes - orders */}
      <Route element={<RoleProtectedRoute allowedRoles={["customer", "admin"]} />}>
        <Route
          path="/order-status"
          element={
            <Layout showHero={false}>
              <OrderStatusPage />
            </Layout>
          }
        />
        <Route
          path="/payment"
          element={
            <Layout showHero={false}>
              <PaymentPage />
            </Layout>
          }
        />
        <Route
          path="/favorites"
          element={
            <Layout showHero={false}>
              <FavoritesPage />
            </Layout>
          }
        />
      </Route>

      {/* Restaurant owner routes */}
      <Route element={<RoleProtectedRoute allowedRoles={["restaurant_owner", "admin"]} />}>
        <Route
          path="/manage-restaurant"
          element={
            <Layout>
              <ManageRestaurantPage />
            </Layout>
          }
        />
        <Route
          path="/business-insights"
          element={
            <Layout showHero={false}>
              <AnalyticsDashboardPage />
            </Layout>
          }
        />
      </Route>

      {/* Delivery driver routes */}
      <Route element={<RoleProtectedRoute allowedRoles={["delivery", "admin"]} />}>
        <Route
          path="/delivery-dashboard"
          element={
            <Layout showHero={false}>
              <DeliveryDashboardPage />
            </Layout>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
