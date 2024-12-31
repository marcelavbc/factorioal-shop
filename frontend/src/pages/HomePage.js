import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [bicycles, setBicycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBicycles = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/bicycles");
        setBicycles(response.data);
      } catch (err) {
        setError("Failed to fetch bicycles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBicycles();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container my-4">
      <h1 className="mb-4">Bicycles for Sale</h1>
      <div className="row">
        {bicycles.map((bicycle) => (
          <div className="col-md-4 mb-4" key={bicycle._id}>
            <div className="card h-100">
              <img
                src={bicycle.image || "https://via.placeholder.com/300"}
                alt={bicycle.name}
                className="card-img-top"
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title">{bicycle.name}</h5>
                <p className="card-text">{bicycle.description}</p>
                <p className="card-text text-muted">Price: ${bicycle.price}</p>
                <Link
                  to={`/bicycle/${bicycle._id}`}
                  className="btn btn-primary"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
