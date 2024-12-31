const mongoose = require("mongoose");

const partOptionSchema = new mongoose.Schema({
  category: { type: String, required: true },
  value: { type: String, required: true },
  stock: { type: String, required: true, enum: ["in_stock", "out_of_stock"] },
  restrictions: {
    type: Map,
    of: [String], // Map with string keys and array of strings as values
  },
});

module.exports = mongoose.model("PartOption", partOptionSchema);
