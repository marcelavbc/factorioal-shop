import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BicyclePage from "./pages/BicyclePage";
import CartPage from "./pages/CartPage";
// import AdminPage from "./pages/AdminPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bicycle/:id" element={<BicyclePage />} />
        <Route path="/cart" element={<CartPage />} />
        {/* <Route path="/admin" element={<AdminPage />} /> */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
