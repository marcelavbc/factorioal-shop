import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getCart, removeFromCart, updateCartItem } from "../api/api";
import LoadingSpinner from "../components/shared/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../components/shared/error/ErrorMessage";

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingQuantities, setEditingQuantities] = useState({});

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartId = localStorage.getItem("cartId");

        if (!cartId) {
          setError("No cart found. Please add items to your cart.");
          setLoading(false);
          return;
        }

        const data = await getCart(cartId);
        setCart(data);

        const initialQuantities = {};
        data.items.forEach((item) => {
          initialQuantities[item._id] = item.quantity;
        });
        setEditingQuantities(initialQuantities);

        if (data.cartId) {
          localStorage.setItem("cartId", data.cartId); // Sync localStorage
        }
      } catch (err) {
        setError("Failed to load cart data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleRemoveItem = async (itemId) => {
    try {
      const cartId = localStorage.getItem("cartId");
      const updatedCart = await removeFromCart(cartId, itemId); // Ensure `itemId` is passed here
      toast.success("Item removed from cart!");
      setCart(updatedCart);
    } catch (err) {
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
    const cartId = localStorage.getItem("cartId"); // Get cartId from localStorage
    const newQuantity = editingQuantities[itemId];

    if (!newQuantity || newQuantity < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }

    try {
      // Call the API to update the quantity
      const updatedCart = await updateCartItem(cartId, itemId, {
        quantity: newQuantity,
      });
      setCart(updatedCart);

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
    const price = item.bicycle?.price || 0;
    const quantity = item.quantity || 0;
    return acc + price * quantity;
  }, 0);

  if (!cart || !cart.items || cart.items.length === 0) {
    return <p>Your cart is empty.</p>;
  }
  return (
    <div className="container my-4">
      <h1>Your Cart</h1>
      {cart.items.map((item) => (
        <div className="card mb-4" key={item._id}>
          <div className="row g-0">
            <div className="col-md-4">
              <img
                src={item.bicycle?.image || "https://via.placeholder.com/300"}
                alt={item.bicycle?.name || "No bicycle available"}
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
