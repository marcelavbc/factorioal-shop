const express = require("express");
const {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
} = require("../controllers/cart.controller");
const validateCartItem = require("../middleware/cartValidation.middleware");

const router = express.Router();

// Add bicycle to cart
router.post("/", validateCartItem, addToCart);

// Get cart contents
router.get("/", getCart);

// Delete route to remove an item from the cart
router.delete("/:id", removeFromCart);

// Update route to update the quantity of an item in the cart
router.patch("/:id", updateCartItem);

module.exports = router;
