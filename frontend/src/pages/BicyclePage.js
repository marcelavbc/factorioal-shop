import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { addToCart, getBicycleById } from "../api/api";
import LoadingSpinner from "../components/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../components/error/ErrorMessage";

const BicyclePage = () => {
  const { id } = useParams(); // Get bicycle ID from URL
  const navigate = useNavigate();
  const [bicycle, setBicycle] = useState(null);
  const [customization, setCustomization] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the bicycle details
  useEffect(() => {
    const fetchBicycle = async () => {
      try {
        const data = await getBicycleById(id);
        console.log("Fetched Bicycle Data:", data); // Log the full data
        setBicycle(data);
      } catch (err) {
        console.error("Failed to fetch bicycle:", err);
        setError("Failed to load bicycle details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBicycle();
  }, [id]);

  // Handle adding to cart
  const handleAddToCart = async () => {
    if (!bicycle || Object.keys(customization).length === 0) {
      toast.error("Please select all customization options.");
      return;
    }

    try {
      const payload = {
        bicycleId: id,
        options: Object.entries(customization).map(([category, value]) => ({
          category,
          value,
        })),
        quantity,
      };
      console.log("Payload for Add to Cart:", payload);

      await addToCart(payload);
      toast.success("Bicycle added to cart!");
      navigate("/cart");
    } catch (err) {
      toast.error("Failed to add to cart.");
    }
  };

  // Render customization options
  const renderOptions = (category, values) => (
    <div key={category} className="mb-3">
      <label>{category}:</label>
      <select
        className="form-select"
        onChange={(e) =>
          setCustomization((prev) => ({ ...prev, [category]: e.target.value }))
        }
        value={customization[category] || ""}
      >
        <option value="">-- Select --</option>
        {values?.map((option) => {
          console.log("Option:", option);
          return (
            <option
              key={option}
              value={option}
              disabled={false} // Adjust this if stock info is available
            >
              {option}
            </option>
          );
        })}
      </select>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!bicycle) return <p>No bicycle found.</p>;

  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-md-6">
          <img
            src={bicycle.image || "https://via.placeholder.com/400"}
            alt={bicycle.name}
            className="img-fluid"
          />
        </div>
        <div className="col-md-6">
          <h2>{bicycle.name}</h2>
          <p>{bicycle.description}</p>
          <h4>${bicycle.price}</h4>
          <hr />
          <h5>Customize Your Bicycle</h5>
          {bicycle.options && Array.isArray(bicycle.options) ? (
            bicycle.options.map(({ category, values }) =>
              renderOptions(category, values)
            )
          ) : (
            <p>No customization options available for this bicycle.</p>
          )}
          <div className="mt-3">
            <label>Quantity:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="form-control w-25"
            />
          </div>
          <button
            className="btn btn-primary mt-3"
            onClick={handleAddToCart}
            disabled={quantity < 1}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default BicyclePage;
