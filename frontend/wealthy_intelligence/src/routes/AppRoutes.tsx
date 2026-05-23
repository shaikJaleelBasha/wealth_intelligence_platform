import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import AdminDashboard from "../pages/admin/AdminDashvboard";
import InvestorDashboard from "../pages/investor/InvestorDashboard";

import AddStock from "../components/admin/AddStock";

import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoutes";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= PROTECTED ROUTES ================= */}
        <Route element={<DashboardLayout />}>
          {/* ADMIN ROUTES */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/stocks/add"
            element={
              <ProtectedRoute role="ADMIN">
                <AddStock />
              </ProtectedRoute>
            }
          />

          {/* INVESTOR ROUTES */}
          <Route
            path="/investor/dashboard"
            element={
              <ProtectedRoute role="INVESTOR">
                <InvestorDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
