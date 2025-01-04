import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

import { addToCart, getBicycleById } from "../../api/api";
import LoadingSpinner from "../../components/shared/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../../components/shared/error/ErrorMessage";
import "./bicyclePage.scss";

const BicyclePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bicycle, setBicycle] = useState(null);
  const [customization, setCustomization] = useState({});
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBicycle = async () => {
      try {
        const data = await getBicycleById(id);
        setBicycle(data);
      } catch (err) {
        setError("Failed to load bicycle details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBicycle();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[1-9]\d*$/.test(value)) {
      setQuantity(value);
    }
  };

  // Check if all required selections are made
  const isFormValid = () => {
    return (
      quantity !== "" &&
      quantity > 0 &&
      bicycle &&
      Object.keys(customization).length === bicycle.options.length &&
      Object.values(customization).every((val) => val !== "")
    );
  };

  const handleAddToCart = async () => {
    let cartId = localStorage.getItem("cartId");

    if (!isFormValid()) {
      toast.error(
        "Please select all customization options and set a valid quantity."
      );
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
        quantity: parseInt(quantity, 10),
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

  const handleAllowedParts = (category, selectedValue) => {
    setCustomization((prevCustomization) => {
      const newCustomization = {
        ...prevCustomization,
        [category]: selectedValue,
      };

      const selectedOption = bicycle.options
        .find((opt) => opt.category === category)
        ?.values.find((val) => val.value === selectedValue);

      if (!selectedOption?.allowedParts) return newCustomization;

      Object.entries(selectedOption.allowedParts).forEach(
        ([allowedCategory, allowedValues]) => {
          if (!allowedValues.includes(newCustomization[allowedCategory])) {
            // 🚨 If the selected value is not allowed, reset the option
            if (newCustomization[allowedCategory]) {
              toast.info(
                `Your selection of "${selectedValue}" restricts "${allowedCategory}" to: ${allowedValues.join(
                  ", "
                )}. Resetting option.`
              );
            }
            newCustomization[allowedCategory] = "";
          }
        }
      );

      return newCustomization;
    });
  };

  const renderOptions = (category, values) => {
    if (!values || values.length === 0) return null;

    let allowedValues = values.map((opt) => opt.value);

    Object.entries(customization).forEach(
      ([selectedCategory, selectedValue]) => {
        const selectedOption = bicycle.options
          .find((opt) => opt.category === selectedCategory)
          ?.values.find((val) => val.value === selectedValue);

        if (selectedOption?.allowedParts?.[category]) {
          allowedValues = selectedOption.allowedParts[category];
        }
      }
    );

    const options = values
      .filter((option) => allowedValues.includes(option.value))
      .map((option) => ({
        value: option.value,
        label:
          option.stock === "out_of_stock"
            ? `${option.value} (Out of Stock)`
            : option.value,
        isDisabled: option.stock === "out_of_stock",
      }));

    return (
      <div key={category} className="option-group">
        <label>{category}:</label>
        <Select
          options={options}
          onChange={(selectedOption) =>
            handleAllowedParts(category, selectedOption.value)
          }
          value={
            options.find((opt) => opt.value === customization[category]) || null
          }
          placeholder="-- Select --"
          isSearchable={false}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!bicycle) return <ErrorMessage message="No bicycle found." />;

  return (
    <div className="container bicycle-container">
      <div className="bicycle-details">
        <div className="bicycle-image">
          <img
            src={bicycle.image || "https://via.placeholder.com/400"}
            alt={bicycle.name}
          />
        </div>
        <div className="bicycle-info">
          <h2>{bicycle.name}</h2>
          <p>{bicycle.description}</p>
          <h4>${bicycle.price}</h4>
          <h5>Customize Your Bicycle</h5>
          {bicycle.options && Array.isArray(bicycle.options) ? (
            bicycle.options.map(({ category, values }) =>
              renderOptions(category, values)
            )
          ) : (
            <p>No customization options available for this bicycle.</p>
          )}

          <div className="quantity-container">
            <label htmlFor="quantity">Quantity:</label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="form-control"
            />
          </div>
          <button
            className="btn btn-primary add-to-cart"
            onClick={handleAddToCart}
            disabled={!isFormValid()}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default BicyclePage;
