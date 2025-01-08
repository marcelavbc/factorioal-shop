import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getCart, removeFromCart, updateCartItem } from "../../api/api";
import { useCart } from "../../context/CartContext";
import LoadingSpinner from "../../components/shared/loadingSpinner/LoadingSpinner";
import ErrorMessage from "../../components/shared/error/ErrorMessage";
import "./cartPage.scss";

const CartPage = () => {
  const { setCartItems } = useCart();
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
        setCartItems(data.items.length);

        // ✅ Initialize `editingQuantities` based on fetched cart items
        const initialQuantities = {};
        data.items.forEach((item) => {
          initialQuantities[item._id] = item.quantity; // Set input value to existing quantity
        });
        setEditingQuantities(initialQuantities);

        setLoading(false);
      } catch (err) {
        setError("Failed to load cart data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [setCartItems]);

  const handleQuantityChange = (itemId, value) => {
    if (value === "" || /^[1-9]\d*$/.test(value)) {
      setEditingQuantities((prev) => ({
        ...prev,
        [itemId]: value,
      }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const cartId = localStorage.getItem("cartId");
      const updatedCart = await removeFromCart(cartId, itemId);
      setCart(updatedCart);

      setCartItems(
        updatedCart.items.reduce((sum, item) => sum + item.quantity, 0)
      );

      toast.success("Item removed from cart!");
    } catch (err) {
      toast.error("Failed to remove item from cart.");
    }
  };

  const handleSaveQuantity = async (itemId) => {
    const cartId = localStorage.getItem("cartId");
    const newQuantity = editingQuantities[itemId];

    if (!newQuantity || newQuantity < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }

    try {
      const updatedCart = await updateCartItem(cartId, itemId, {
        quantity: parseInt(newQuantity, 10),
      });
      setCart(updatedCart);

      setCartItems(
        updatedCart.items.reduce((sum, item) => sum + item.quantity, 0)
      );

      toast.success("Quantity updated!");
    } catch (err) {
      toast.error("Failed to update quantity.");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!cart || cart.items.length === 0)
    return <ErrorMessage message="Your cart is empty." />;

  const totalPrice = cart.items.reduce((acc, item) => {
    const price = item.bicycle?.price || 0;
    const quantity = item.quantity || 0;
    return acc + price * quantity;
  }, 0);

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
                  <label htmlFor={`quantity-${item._id}`} className="me-2">
                    Quantity:
                  </label>
                  <input
                    id={`quantity-${item._id}`}
                    type="text"
                    value={editingQuantities[item._id]}
                    onChange={(e) =>
                      handleQuantityChange(item._id, e.target.value)
                    }
                    className="form-control w-25 me-2"
                  />
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleSaveQuantity(item._id)}
                    disabled={
                      !editingQuantities[item._id] ||
                      editingQuantities[item._id] === item.quantity
                    }
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
