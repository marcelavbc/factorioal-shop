import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBicycles, getPartOptions } from "../../../api/api";
import LoadingSpinner from "../../../components/shared/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../../../components/shared/error/ErrorMessage";
import "./adminOverview.scss";

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const bicycles = await getBicycles();
        const partOptions = await getPartOptions();
        setStats({
          totalBicycles: bicycles.length,
          totalPartOptions: partOptions.length,
        });
      } catch (err) {
        setError("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="admin-container">
      <h1>Admin Overview</h1>
      <div className="admin-dashboard">
        <div className="admin-card">
          <h2 data-testId="total-bikes-value">{stats.totalBicycles}</h2>
          <p data-testId="total-bicycles">Total Bicycles</p>
          <Link to="/admin/bicycles" className="admin-btn">
            Manage Bicycles
          </Link>
        </div>
        <div className="admin-card">
          <h2 data-testId="total-parts-value">{stats.totalPartOptions}</h2>
          <p>Total Part Options</p>
          <Link to="/admin/part-options" className="admin-btn">
            Manage Part Options
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
