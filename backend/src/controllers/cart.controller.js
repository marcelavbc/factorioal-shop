const Cart = require("../models/cart.model");
const Bicycle = require("../models/bicycle.model");

// Add bicycle to cart
exports.addToCart = async (req, res) => {
  try {
    const { bicycleId, options, quantity } = req.body;

    console.log("Received Payload:", req.body); // Log the payload for debugging

    // Validate request data
    if (!bicycleId || !Array.isArray(options) || quantity < 1) {
      console.error("Validation Failed: Invalid request data");
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Check if the bicycle exists
    const bicycle = await Bicycle.findById(bicycleId);
    if (!bicycle) {
      console.error("Validation Failed: Bicycle not found");
      return res.status(404).json({ message: "Bicycle not found" });
    }

    // Fetch or create the cart
    let cart = await Cart.findOne();
    if (!cart) {
      cart = new Cart();
    }

    // Ensure we're adding only the bicycleId (not the full bicycle object)
    const item = cart.items.find(
      (item) =>
        item.bicycle.toString() === bicycleId &&
        JSON.stringify(item.options) === JSON.stringify(options)
    );

    if (item) {
      // Update quantity if the item exists
      item.quantity += quantity;
    } else {
      // Add new item to the cart with the bicycleId reference
      cart.items.push({ bicycle: bicycleId, options, quantity });
    }

    // Save the cart
    const updatedCart = await cart.save();
    res.status(200).json(updatedCart);
  } catch (err) {
    console.error("Error adding to cart:", err); // Debug errors
    res
      .status(500)
      .json({ message: "Failed to add to cart", error: err.message });
  }
};

// Get cart contents
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne().populate({
      path: "items.bicycle",
      select: "name price image",
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    res.status(200).json(cart);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch cart", error: err.message });
  }
};

// Remove a cart item
exports.removeCartItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    // Find the cart and remove the item
    let cart = await Cart.findOne(); // Assuming a single cart per user
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Filter out the item to be removed
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    await cart.save();

    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to remove item", error: error.message });
  }
};

// Update a cart item
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1." });
    }

    const cart = await Cart.findOne();
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((item) => item._id.toString() === id);
    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    await cart.save();

    res.json(cart);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update cart item", error: err.message });
  }
};
