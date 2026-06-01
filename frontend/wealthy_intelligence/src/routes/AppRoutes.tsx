import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/*
|--------------------------------------------------------------------------
| AUTH PAGES
|--------------------------------------------------------------------------
*/
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

/*
|--------------------------------------------------------------------------
| ADMIN PAGES
|--------------------------------------------------------------------------
*/
import AdminDashboard from "../pages/admin/AdminDashvboard";
import ManageStocks from "../pages/admin/ManageStocks";
import AddStock from "../components/admin/AddStock";
import Investors from "../pages/admin/Investors";
import MarketPrices from "../pages/admin/MarketPrices";
import AdminAnalytics from "../pages/admin/Analytics";

/*
|--------------------------------------------------------------------------
| INVESTOR PAGES
|--------------------------------------------------------------------------
*/
import InvestorDashboard from "../pages/investor/InvestorDashboard";
import Portfolio from "../pages/investor/Portfolio";
import Holdings from "../components/investor/stocks/Holdings";
import BuyStock from "../components/investor/stocks/BuyStock";
import SellStock from "../components/investor/stocks/SellStock";
import TransactionHistory from "../pages/investor/TransactionHistory";
import MutualFunds from "../pages/investor/MutualFunds";
import InvestorAnalytics from "../pages/investor/Analytics";

/*
|--------------------------------------------------------------------------
| LAYOUT + GUARD
|--------------------------------------------------------------------------
*/
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoutes";
import Stocks from "../pages/investor/Stocks";
import ProfilePage from "../pages/auth/ProfilePage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================================================
            DEFAULT ROUTE
        ========================================================= */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* =========================================================
            PUBLIC ROUTES
        ========================================================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* =========================================================
            PROTECTED DASHBOARD AREA
        ========================================================= */}
        <Route element={<DashboardLayout />}>
          {/* ================= ADMIN ROUTES ================= */}

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/investor/stocks"
            element={
              <ProtectedRoute roles={["INVESTOR"]}>
                <Stocks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/stocks"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <ManageStocks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/stocks/add"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AddStock />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/investors"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <Investors />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/market-prices"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <MarketPrices />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ================= INVESTOR ROUTES ================= */}

          <Route
            path="/investor/dashboard"
            element={
              <ProtectedRoute roles={["INVESTOR"]}>
                <InvestorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/investor/portfolio"
            element={
              <ProtectedRoute roles={["INVESTOR"]}>
                <Portfolio />
              </ProtectedRoute>
            }
          />

          <Route
            path="/investor/holdings"
            element={
              <ProtectedRoute roles={["INVESTOR"]}>
                <Holdings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/investor/stocks/buy"
            element={
              <ProtectedRoute roles={["INVESTOR"]}>
                <BuyStock />
              </ProtectedRoute>
            }
          />

          <Route
            path="/investor/stocks/sell"
            element={
              <ProtectedRoute roles={["INVESTOR"]}>
                <SellStock />
              </ProtectedRoute>
            }
          />

          <Route
            path="/investor/transactions"
            element={
              <ProtectedRoute roles={["INVESTOR"]}>
                <TransactionHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/investor/mutual-funds"
            element={
              <ProtectedRoute roles={["INVESTOR"]}>
                <MutualFunds />
              </ProtectedRoute>
            }
          />

          <Route
            path="/investor/analytics"
            element={
              <ProtectedRoute roles={["INVESTOR"]}>
                <InvestorAnalytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/investor/profile"
            element={
              <ProtectedRoute roles={["INVESTOR"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
