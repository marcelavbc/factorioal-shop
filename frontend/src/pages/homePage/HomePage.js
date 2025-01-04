import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./homePage.scss"; // ✅ Import SCSS file

import LoadingSpinner from "../../components/shared/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../../components/shared/error/ErrorMessage";
import { getBicycles } from "../../api/api";

const HomePage = () => {
  const [bicycles, setBicycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBicycles = async () => {
      try {
        const data = await getBicycles();
        setBicycles(data);
      } catch (err) {
        setError("🚨 Failed to fetch bicycles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBicycles();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!bicycles.length)
    return <ErrorMessage message="No bicycles available." />;

  return (
    <div className="home-container">
      <h1 className="home-title">🚴 Bicycles for Sale</h1>
      <div className="bicycle-grid">
        {bicycles.map((bicycle) => (
          <div className="bicycle-card" key={bicycle._id}>
            <img
              src={bicycle.image || "https://via.placeholder.com/300"}
              alt={bicycle.name}
              className="bicycle-image"
            />
            <div className="bicycle-info">
              <h5>{bicycle.name}</h5>
              <p className="bicycle-description">{bicycle.description}</p>
              <p className="bicycle-price">💲{bicycle.price}</p>
              <Link to={`/bicycle/${bicycle._id}`} className="view-details">
                🔍 View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
