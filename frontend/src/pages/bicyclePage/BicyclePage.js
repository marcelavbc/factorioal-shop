import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

import {
  addToCart,
  getBicycleById,
  getCart,
  updateCartItem,
} from "../../api/api";
import LoadingSpinner from "../../components/shared/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../../components/shared/error/ErrorMessage";
import { useCart } from "../../context/CartContext";

import "./bicyclePage.scss";
import { BICYCLES_INPUTS_FIXED_ORDER } from "../../constants";

const BicyclePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bicycle, setBicycle] = useState(null);
  const [customization, setCustomization] = useState({});
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setCartItems } = useCart();

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

  // ✅ **Ensure all required selections are made**
  const isFormValid = () => {
    return (
      quantity !== "" &&
      quantity > 0 &&
      bicycle &&
      Object.keys(customization).length === bicycle.options.length &&
      Object.values(customization).every((val) => val !== "")
    );
  };

  // ✅ **Add to Cart with Valid Selections**
  const handleAddToCart = async () => {
    let cartId = localStorage.getItem("cartId");
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

      let currentCart = cartId ? await getCart(cartId) : { items: [] };

      const existingItem = currentCart.items.find((item) => {
        if (item.bicycle._id !== id) return false;
        if (item.options.length !== payload.options.length) return false;
        return item.options.every(
          (opt, index) =>
            opt.category === payload.options[index].category &&
            opt.value === payload.options[index].value
        );
      });

      if (existingItem) {
        const updatedQuantity = existingItem.quantity + parseInt(quantity, 10);

        await updateCartItem(cartId, existingItem._id, {
          quantity: updatedQuantity,
        });
        toast.success(`Updated quantity to ${updatedQuantity}!`);
      } else {
        const response = await addToCart(payload);
        if (!cartId && response.cartId) {
          localStorage.setItem("cartId", response.cartId);
        }
        toast.success("Bicycle added to cart!");
      }

      let updatedCart = await getCart(cartId);
      setCartItems(
        updatedCart.items.reduce((sum, item) => sum + item.quantity, 0)
      );

      navigate("/cart");
    } catch (err) {
      toast.error("Failed to add to cart.");
    }
  };

  // ✅ **Handle Restrictions (Previously handleAllowedParts)**
  const handleRestrictions = (category, selectedValue) => {
    setCustomization((prevCustomization) => {
      const newCustomization = {
        ...prevCustomization,
        [category]: selectedValue,
      };

      const selectedOption = bicycle.options
        .find((opt) => opt.category === category)
        ?.values.find((val) => val.value === selectedValue);

      if (!selectedOption?.restrictions) return newCustomization;

      let invalidSelections = [];

      Object.entries(selectedOption.restrictions).forEach(
        ([restrictedCategory, restrictedValues]) => {
          if (restrictedValues.includes(newCustomization[restrictedCategory])) {
            invalidSelections.push(
              `🚫 Restriction: "${selectedValue}" does NOT allow "${restrictedCategory}" to be "${newCustomization[restrictedCategory]}".`
            );
            newCustomization[restrictedCategory] = "";
          }
        }
      );

      invalidSelections.forEach((msg) => toast.error(msg));

      return newCustomization;
    });
  };

  const renderOptions = (category, values) => {
    if (!values || values.length === 0) return null;

    let validValues = values.map((opt) => opt.value);

    Object.entries(customization).forEach(
      ([selectedCategory, selectedValue]) => {
        const selectedOption = bicycle.options
          .find((opt) => opt.category === selectedCategory)
          ?.values.find((val) => val.value === selectedValue);

        if (selectedOption?.restrictions?.[category]) {
          validValues = validValues.filter(
            (val) => !selectedOption.restrictions[category].includes(val)
          );
        }
      }
    );

    const options = values
      .filter((option) => validValues.includes(option.value))
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
        <label id={`label-${category.replace(/\s+/g, "-")}`}>{category}:</label>
        <Select
          inputId={`select-${category.replace(/\s+/g, "-")}`}
          aria-labelledby={`label-${category.replace(/\s+/g, "-")}`}
          options={options}
          onChange={(selectedOption) =>
            handleRestrictions(category, selectedOption.value)
          }
          value={
            options.find((opt) => opt.value === customization[category]) || null
          }
          placeholder="-- Select --"
          isSearchable={false}
          className="react-select-container"
          classNamePrefix="react-select"
          data-testid={`select-test-${category.replace(/\s+/g, "-")}`}
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
            BICYCLES_INPUTS_FIXED_ORDER.map((category) => {
              const option = bicycle.options.find(
                (opt) => opt.category === category
              );
              return option
                ? renderOptions(option.category, option.values)
                : null;
            })
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
