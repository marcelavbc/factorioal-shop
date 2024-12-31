const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  bicycle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bicycle",
    required: true,
  },
  options: [
    {
      category: { type: String, required: true },
      value: { type: String, required: true },
    },
  ],
  quantity: { type: Number, required: true, default: 1 },
});

const cartSchema = new mongoose.Schema({
  items: [cartItemSchema],
});

module.exports = mongoose.model("Cart", cartSchema);
