import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { addToCart, getBicycleById } from "../api/api";
import LoadingSpinner from "../components/shared/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../components/shared/error/ErrorMessage";

const BicyclePage = () => {
  const { id } = useParams(); // Get bicycle ID from URL
  const navigate = useNavigate();
  const [bicycle, setBicycle] = useState(null);
  const [customization, setCustomization] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBicycle = async () => {
      try {
        const data = await getBicycleById(id);
        const mergedOptions = mergeOptionsByCategory(data.options);
        setBicycle({ ...data, options: mergedOptions });
      } catch (err) {
        setError("Failed to load bicycle details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBicycle();
  }, [id]);

  const mergeOptionsByCategory = (optionsArray) => {
    const mergedOptions = {};

    optionsArray.forEach(({ category, values }) => {
      if (!mergedOptions[category]) {
        mergedOptions[category] = [];
      }

      values.forEach((val) => {
        if (!mergedOptions[category].some((v) => v.value === val.value)) {
          mergedOptions[category].push(val);
        }
      });
    });

    return Object.entries(mergedOptions).map(([category, values]) => ({
      category,
      values,
    }));
  };

  const handleAddToCart = async () => {
    let cartId = localStorage.getItem("cartId");

    if (!bicycle || Object.keys(customization).length === 0) {
      toast.error("Please select all customization options.");
      return;
    }

    try {
      const payload = {
        cartId: cartId || undefined,
        bicycleId: id,
        options: Object.entries(customization).map(([category, value]) => ({
          category,
          value,
        })),
        quantity,
      };

      const response = await addToCart(payload);

      if (!cartId && response.cartId) {
        localStorage.setItem("cartId", response.cartId);
      }

      toast.success("Bicycle added to cart!");
      navigate("/cart");
    } catch (err) {
      toast.error("Failed to add to cart.");
    }
  };

  const handleRestrictions = (category, selectedValue) => {
    setCustomization((prevCustomization) => {
      const newCustomization = {
        ...prevCustomization,
        [category]: selectedValue,
      };

      // Find the selected option's restrictions
      const selectedOption = bicycle.options
        .find((opt) => opt.category === category)
        ?.values.find((val) => val.value === selectedValue);

      if (!selectedOption) {
        return prevCustomization;
      }

      if (
        !selectedOption.restrictions ||
        Object.keys(selectedOption.restrictions).length === 0
      ) {
        return newCustomization;
      }

      // Apply restrictions by resetting disallowed selections
      Object.entries(selectedOption.restrictions).forEach(
        ([restrictedCategory, allowedValues]) => {
          // Reset the restricted category if the current selection is invalid
          if (!allowedValues.includes(newCustomization[restrictedCategory])) {
            newCustomization[restrictedCategory] = "";
          }
        }
      );

      return newCustomization;
    });
  };

  // Render customization options
  const renderOptions = (category, values) => {
    if (!values || values.length === 0) return null;

    let allowedValues = values.map((opt) => opt.value);

    // Apply restrictions by filtering out disallowed values
    Object.entries(customization).forEach(
      ([selectedCategory, selectedValue]) => {
        const selectedOption = bicycle.options
          .find((opt) => opt.category === selectedCategory)
          ?.values.find((val) => val.value === selectedValue);

        if (selectedOption && selectedOption.restrictions?.[category]) {
          allowedValues = allowedValues.filter(
            (value) => !selectedOption.restrictions[category].includes(value)
          );
        }
      }
    );

    return (
      <div key={category} className="mb-3">
        <label>{category}:</label>
        <select
          className="form-select"
          onChange={(e) => {
            const selectedValue = e.target.value;
            handleRestrictions(category, selectedValue);
            setCustomization((prev) => ({
              ...prev,
              [category]: selectedValue,
            }));
          }}
          value={customization[category] || ""}
        >
          <option value="">-- Select --</option>
          {values
            .filter((option) => allowedValues.includes(option.value))
            .map((option, index) => (
              <option
                key={index}
                value={option.value}
                disabled={option.stock === "out_of_stock"}
              >
                {option.value}{" "}
                {option.stock === "out_of_stock" && "(Temporary Out of Stock)"}
              </option>
            ))}
        </select>
      </div>
    );
  };

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
