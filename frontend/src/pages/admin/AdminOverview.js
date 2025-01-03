import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBicycles, getPartOptions } from "../../api/api";
import LoadingSpinner from "../../components/shared/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../../components/shared/error/ErrorMessage";

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
        console.error("Error fetching stats:", err);
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
    <div className="container my-4">
      <h1>Admin Overview</h1>
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card text-center">
            <div className="card-body">
              <h2>{stats.totalBicycles}</h2>
              <p>Total Bicycles</p>
              <Link to="/admin/bicycles" className="btn btn-primary">
                Manage Bicycles
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card text-center">
            <div className="card-body">
              <h2>{stats.totalPartOptions}</h2>
              <p>Total Part Options</p>
              <Link to="/admin/part-options" className="btn btn-primary">
                Manage Part Options
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
