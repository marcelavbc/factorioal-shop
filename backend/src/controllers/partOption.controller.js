const PartOption = require("../models/partOption.model");
const mongoose = require("mongoose");

// Add a new part option with restrictions
exports.addOption = async (req, res) => {
  try {
    const { category, value, stock, restrictions } = req.body;

    // 🔥 Check if part option already exists
    const existingOption = await PartOption.findOne({ category, value });
    if (existingOption) {
      return res.status(400).json({ message: "Part option already exists" });
    }

    const newOption = new PartOption({
      category,
      value,
      stock: stock || "in_stock",
      restrictions: restrictions || {},
    });

    const savedOption = await newOption.save();
    res.status(201).json(savedOption);
  } catch (err) {
    console.error("Error adding part option:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors,
      });
    }

    res.status(500).json({
      message: "Failed to add part option",
      error: err.message,
    });
  }
};

// Remove a part option
exports.removeOption = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOption = await PartOption.findByIdAndDelete(id);
    if (!deletedOption) {
      return res.status(404).json({ message: "Part option not found" });
    }

    res
      .status(200)
      .json({ message: "Part option removed successfully", deletedOption });
  } catch (err) {
    console.error("Error removing part option:", err);
    res
      .status(500)
      .json({ message: "Failed to remove part option", error: err.message });
  }
};

// Update a part option

exports.updatePartOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, value, stock } = req.body;

    // 🔥 Check if `id` is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid part option ID" });
    }

    const option = await PartOption.findById(id);
    if (!option) {
      return res.status(404).json({ message: "Part option not found" });
    }

    // 🔥 Validate fields BEFORE updating
    if (
      (category !== undefined && category.trim() === "") ||
      (value !== undefined && value.trim() === "")
    ) {
      return res.status(400).json({ message: "Invalid update fields" });
    }

    if (category !== undefined) option.category = category;
    if (value !== undefined) option.value = value;
    if (stock !== undefined) option.stock = stock;

    const updatedOption = await option.save();
    res.status(200).json(updatedOption);
  } catch (err) {
    console.error("Error updating part option:", err);
    res.status(500).json({
      message: "Failed to update part option",
      error: err.message,
    });
  }
};

// ✅ Update Restrictions
exports.updateRestrictions = async (req, res) => {
  try {
    const { id } = req.params;
    const { restrictions } = req.body;

    const option = await PartOption.findById(id);
    if (!option) {
      return res.status(404).json({ message: "Part option not found" });
    }

    option.restrictions = restrictions;
    const updatedOption = await option.save();

    res.status(200).json({
      message: "Restrictions updated successfully",
      updatedOption,
    });
  } catch (err) {
    console.error("Error updating restrictions:", err);
    res
      .status(500)
      .json({ message: "Failed to update restrictions", error: err.message });
  }
};

// Fetch all part options
exports.getPartOptions = async (req, res) => {
  try {
    const partOptions = await PartOption.find();
    res.status(200).json(partOptions);
  } catch (err) {
    console.error("Error fetching part options:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch part options", error: err.message });
  }
};

// Delete a part option by ID

exports.deletePartOption = async (req, res) => {
  const { id } = req.params;

  try {
    // 🔥 Validate ObjectId format before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid part option ID" });
    }

    const deletedOption = await PartOption.findByIdAndDelete(id);
    if (!deletedOption) {
      return res.status(404).json({ message: "Part option not found" });
    }

    res.status(200).json({ message: "Part option deleted successfully" });
  } catch (err) {
    console.error("Error deleting part option:", err);
    res.status(500).json({
      message: "Failed to delete part option",
      error: err.message,
    });
  }
};
