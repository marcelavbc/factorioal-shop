const mongoose = require("mongoose");

const bicycleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  options: [
    {
      category: { type: String, required: true },
      values: [{ type: String }],
    },
  ],
  partOptions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PartOption",
    },
  ],
});

module.exports = mongoose.model("Bicycle", bicycleSchema);
