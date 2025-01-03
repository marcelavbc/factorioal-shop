import React from "react";
import { Link, Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="container my-4">
      <h1>Admin Dashboard</h1>
      <nav className="nav nav-pills mb-4">
        <Link className="nav-link" to="/admin">
          Overview
        </Link>
        <Link className="nav-link" to="/admin/bicycles">
          Manage Bicycles
        </Link>
        <Link className="nav-link" to="/admin/part-options">
          Manage Part Options
        </Link>
        <Link to="/admin/restrictions" className="nav-link">
          Manage Restrictions
        </Link>
      </nav>
      <Outlet />
    </div>
  );
};

export default DashboardLayout;
