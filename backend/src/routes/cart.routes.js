const express = require("express");
const {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
} = require("../controllers/cart.controller");
const validateCartItem = require("../middleware/cartValidation.middleware");

const router = express.Router();

router.post("/", validateCartItem, addToCart);

router.get("/", getCart);

router.delete("/:id", removeFromCart);

router.patch("/:id", updateCartItem);

module.exports = router;
