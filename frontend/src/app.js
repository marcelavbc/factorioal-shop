import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BicyclePage from "./pages/BicyclePage";
import CartPage from "./pages/CartPage";
import DashboardLayout from "./components/admin/DashboardLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminBicycles from "./pages/admin/AdminBicycles";
import AdminParts from "./pages/admin/AdminParts";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bicycle/:id" element={<BicyclePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="bicycles" element={<AdminBicycles />} />
          <Route path="/admin/part-options" element={<AdminParts />} />
        </Route>
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;
