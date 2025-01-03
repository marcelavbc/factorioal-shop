const PartOption = require("../models/partOption.model");
const Bicycle = require("../models/bicycle.model");

// Add a new part option and update existing bicycles
exports.addOption = async (req, res) => {
  try {
    const { category, value, stock, restrictions } = req.body;

    console.log(
      `🛠 Adding new part option - Category: ${category}, Value: ${value}`
    );

    // Create a new part option
    const newOption = new PartOption({
      category,
      value,
      stock: stock || "in_stock",
      restrictions: restrictions || {},
    });

    // Save the new part option
    const savedOption = await newOption.save();
    console.log(`✅ New part option saved:`, savedOption);

    // Find all bicycles that have this category
    const bicyclesToUpdate = await Bicycle.find({
      "options.category": category,
    });

    console.log(`🔄 Bicycles to update: ${bicyclesToUpdate.length}`);

    if (bicyclesToUpdate.length > 0) {
      // Update all bicycles that have this category
      const result = await Bicycle.updateMany(
        { "options.category": category },
        {
          $addToSet: {
            "options.$.values": { value, stock: stock || "in_stock" },
          },
        }
      );

      console.log(`✅ Bicycles updated:`, result);
    } else {
      console.log(`⚠️ No bicycles found with category: ${category}`);
    }

    res
      .status(201)
      .json({ message: "Part option added and bicycles updated", savedOption });
  } catch (err) {
    console.error("❌ Error adding part option:", err);
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
