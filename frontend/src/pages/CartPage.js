import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getCart, removeFromCart, updateCartItem } from "../api/api";
import LoadingSpinner from "../components/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../components/error/ErrorMessage";

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingQuantities, setEditingQuantities] = useState({}); // Track quantity edits

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await getCart();
        setCart(data);
        // Initialize editing quantities
        const initialQuantities = {};
        data.items.forEach((item) => {
          initialQuantities[item._id] = item.quantity;
        });
        setEditingQuantities(initialQuantities);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        setError("Failed to load cart data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success("Item removed from cart!");
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.filter((item) => item._id !== itemId),
      }));
    } catch (err) {
      console.error("Failed to remove item:", err);
      toast.error("Failed to remove item from cart.");
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    setEditingQuantities((prev) => ({
      ...prev,
      [itemId]: newQuantity,
    }));
  };

  const handleSaveQuantity = async (itemId) => {
    const newQuantity = editingQuantities[itemId];

    if (newQuantity < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }

    try {
      const updatedCart = await updateCartItem(itemId, {
        quantity: newQuantity,
      });
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.map((item) =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        ),
      }));
      toast.success("Quantity updated!");
    } catch (err) {
      console.error("Failed to update quantity:", err);
      toast.error("Failed to update quantity.");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!cart || cart.items.length === 0) return <p>Your cart is empty.</p>;

  const totalPrice = cart.items.reduce((acc, item) => {
    console.log("Item Details:", item); // Debug each item's details
    const price = item.bicycle?.price || 0; // Ensure price is valid
    const quantity = item.quantity || 0; // Ensure quantity is valid
    return acc + price * quantity;
  }, 0);

  console.log("Total Price:", totalPrice); // Debug the total price

  return (
    <div className="container my-4">
      <h1>Your Cart</h1>
      {cart.items.map((item) => (
        <div className="card mb-4" key={item._id}>
          <div className="row g-0">
            <div className="col-md-4">
              <img
                src={item.bicycle.image || "https://via.placeholder.com/300"}
                alt={item.bicycle.name}
                className="img-fluid rounded-start"
              />
            </div>
            <div className="col-md-8">
              <div className="card-body">
                <h5 className="card-title">{item.bicycle.name}</h5>
                <p className="card-text">
                  <strong>Options:</strong>{" "}
                  {item.options.map(
                    (opt, index) =>
                      `${opt.category}: ${opt.value}${
                        index < item.options.length - 1 ? ", " : ""
                      }`
                  )}
                </p>
                <p className="card-text">
                  <strong>Price:</strong> ${item.bicycle.price}
                </p>
                <div className="d-flex align-items-center mt-2">
                  <label className="me-2">Quantity:</label>
                  <input
                    type="number"
                    min="0"
                    value={editingQuantities[item._id] || ""}
                    onChange={(e) =>
                      handleQuantityChange(item._id, Number(e.target.value))
                    }
                    className="form-control w-25 me-2"
                  />
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleSaveQuantity(item._id)}
                  >
                    Save
                  </button>
                </div>
                <button
                  className="btn btn-danger mt-3"
                  onClick={() => handleRemoveItem(item._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <h3>Total: ${totalPrice.toFixed(2)}</h3>
      <Link to="/" className="btn btn-primary">
        Continue Shopping
      </Link>
      <button
        className="btn btn-success ms-3"
        onClick={() => toast.info("Checkout coming soon!")}
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartPage;
