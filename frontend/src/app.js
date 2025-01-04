import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "./components/layout/Layout";
import AdminRestrictions from "./pages/admin/adminRestrictions/AdminRestrictions";
import BicyclePage from "./pages/bicyclePage/BicyclePage";
import HomePage from "./pages/homePage/HomePage";
import CartPage from "./pages/cartPage/CartPage";
import AdminOverview from "./pages/admin/adminOverview/AdminOverview";
import DashboardLayout from "./components/admin/dashboardLayout/DashboardLayout";
import AdminBicycles from "./pages/admin/adminBicycles/AdminBicycles";
import AdminParts from "./pages/admin/adminParts/AdminParts";
import { CartProvider } from "./context/CartContext";

const App = () => {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/bicycle/:id" element={<BicyclePage />} />
            <Route path="/cart" element={<CartPage />} />
          </Route>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="bicycles" element={<AdminBicycles />} />
            <Route path="part-options" element={<AdminParts />} />
            <Route path="restrictions" element={<AdminRestrictions />} />
          </Route>
        </Routes>
        <ToastContainer autoClose={3000} position="top-right" />
      </Router>
    </CartProvider>
  );
};

export default App;
