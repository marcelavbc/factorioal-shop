const PartOption = require("../models/partOption.model");
const Bicycle = require("../models/bicycle.model");

// Add a new part option with allowedParts
exports.addOption = async (req, res) => {
  try {
    const { category, value, stock, allowedParts } = req.body;

    const newOption = new PartOption({
      category,
      value,
      stock: stock || "in_stock",
      allowedParts: allowedParts || {},
    });

    const savedOption = await newOption.save();
    res.status(201).json(savedOption);
  } catch (err) {
    console.error("Error adding part option:", err);
    res
      .status(500)
      .json({ message: "Failed to add part option", error: err.message });
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

// Update a part option (category, value, or stock)
exports.updatePartOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, value, stock } = req.body;

    const option = await PartOption.findById(id);
    if (!option) {
      return res.status(404).json({ message: "Part option not found" });
    }

    // ✅ Update only the fields that were sent in the request
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

// Update Allowed Parts
exports.updateAllowedParts = async (req, res) => {
  try {
    const { id } = req.params;
    const { allowedParts } = req.body;

    const option = await PartOption.findById(id);
    if (!option) {
      return res.status(404).json({ message: "Part option not found" });
    }

    option.allowedParts = allowedParts;
    const updatedOption = await option.save();

    res.status(200).json(updatedOption);
  } catch (err) {
    console.error("Error updating allowed parts:", err);
    res
      .status(500)
      .json({ message: "Failed to update allowed parts", error: err.message });
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
    const deletedOption = await PartOption.findByIdAndDelete(id);
    if (!deletedOption) {
      return res.status(404).json({ message: "Part option not found" });
    }
    res.status(200).json({ message: "Part option deleted successfully" });
  } catch (err) {
    console.error("Error deleting part option:", err);
    res
      .status(500)
      .json({ message: "Failed to delete part option", error: err.message });
  }
};
