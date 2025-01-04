import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./dashboardLayout.scss";

const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <nav className="admin-nav">
        <Link
          className={`nav-link ${
            location.pathname === "/admin" ? "active" : ""
          }`}
          to="/admin"
        >
          Overview
        </Link>
        <Link
          className={`nav-link ${
            location.pathname === "/admin/bicycles" ? "active" : ""
          }`}
          to="/admin/bicycles"
        >
          Manage Bicycles
        </Link>
        <Link
          className={`nav-link ${
            location.pathname === "/admin/part-options" ? "active" : ""
          }`}
          to="/admin/part-options"
        >
          Manage Part Options
        </Link>
        <Link
          className={`nav-link ${
            location.pathname === "/admin/restrictions" ? "active" : ""
          }`}
          to="/admin/restrictions"
        >
          Manage Restrictions
        </Link>
      </nav>
      <Outlet />
    </div>
  );
};

export default DashboardLayout;
