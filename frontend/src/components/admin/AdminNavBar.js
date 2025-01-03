import React from "react";
import { Link } from "react-router-dom";

const AdminNavBar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/admin">
          Admin Dashboard
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbar"
          aria-controls="adminNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="adminNavbar">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/admin">
                Overview
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/bicycles">
                Manage Bicycles
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/part-options">
                Manage Part Options
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavBar;
