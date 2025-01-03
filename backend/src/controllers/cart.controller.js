const Cart = require("../models/cart.model");
const Bicycle = require("../models/bicycle.model");
const mongoose = require("mongoose");

// Add bicycle to cart
exports.addToCart = async (req, res) => {
  const { cartId, bicycleId, options, quantity } = req.body;

  try {
    let cart;

    if (!cartId) {
      // Create a new cart only if `cartId` is missing
      cart = await Cart.create({ items: [] });
    } else {
      cart = await Cart.findById(cartId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
    }

    // Add the bicycle to the cart
    const existingItem = cart.items.find(
      (item) =>
        item.bicycle.toString() === bicycleId &&
        JSON.stringify(item.options) === JSON.stringify(options)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ bicycle: bicycleId, options, quantity });
    }

    await cart.save();

    res.status(200).json({
      message: "Item added to cart",
      cartId: cart._id,
      items: cart.items,
    });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res
      .status(500)
      .json({ message: "Failed to add to cart", error: err.message });
  }
};

// Get cart contents
exports.getCart = async (req, res) => {
  try {
    let { cartId } = req.query;

    if (!cartId) {
      return res.status(200).json({
        message: "Your cart is empty. Please add items to your cart.",
        items: [],
      });
    }

    const cart = await Cart.findById(cartId).populate({
      path: "items.bicycle",
      select: "name price image",
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ cartId: cart._id, items: cart.items });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch cart", error: err.message });
  }
};

// Remove a cart item
exports.removeFromCart = async (req, res) => {
  const { cartId } = req.body;
  const { id: itemId } = req.params;

  if (!cartId || !itemId) {
    return res
      .status(400)
      .json({ message: "Cart ID and Item ID are required" });
  }

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    await cart.save();
    // Fetch the updated cart with populated bicycle details
    const updatedCart = await Cart.findById(cartId).populate({
      path: "items.bicycle",
      select: "name price image",
    });
    res.status(200).json(updatedCart);
  } catch (err) {
    console.error("Error removing from cart:", err);
    res
      .status(500)
      .json({ message: "Failed to remove item", error: err.message });
  }
};

// Update a cart item
exports.updateCartItem = async (req, res) => {
  const { cartId } = req.query; // Expect `cartId` from the query params
  const { id: itemId } = req.params; // Item to update
  const { quantity } = req.body;

  if (!cartId) {
    return res.status(400).json({ message: "cartId is required" });
  }

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1." });
  }

  try {
    const cart = await Cart.findById(cartId).populate({
      path: "items.bicycle",
      select: "name price image",
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found to update" });
    }

    // Find the item in the cart
    const item = cart.items.find((item) => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Update the quantity
    item.quantity = quantity;
    await cart.save(); // Save updated cart

    res.status(200).json(cart);
  } catch (err) {
    console.error("Error updating cart item:", err);
    res
      .status(500)
      .json({ message: "Failed to update cart item", error: err.message });
  }
};
