const PartOption = require("../models/partOption.model");

// Add a new part option
exports.addOption = async (req, res) => {
  try {
    const { category, value, stock, restrictions } = req.body;

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

// Toggle stock status
exports.toggleStock = async (req, res) => {
  try {
    const { id } = req.params;

    const option = await PartOption.findById(id);
    if (!option) {
      return res.status(404).json({ message: "Part option not found" });
    }

    // Toggle the stock status
    option.stock = option.stock === "in_stock" ? "out_of_stock" : "in_stock";
    const updatedOption = await option.save();

    res.status(200).json(updatedOption);
  } catch (err) {
    console.error("Error toggling stock status:", err);
    res
      .status(500)
      .json({ message: "Failed to toggle stock status", error: err.message });
  }
};

// Update compatibility rules
exports.updateRestrictions = async (req, res) => {
  try {
    const { id } = req.params;
    const { restrictions } = req.body;

    const option = await PartOption.findById(id);
    if (!option) {
      return res.status(404).json({ message: "Part option not found" });
    }

    // Update restrictions
    option.restrictions = restrictions;
    const updatedOption = await option.save();

    res.status(200).json(updatedOption);
  } catch (err) {
    console.error("Error updating restrictions:", err);
    res
      .status(500)
      .json({ message: "Failed to update restrictions", error: err.message });
  }
};
