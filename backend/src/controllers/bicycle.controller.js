const Bicycle = require("../models/bicycle.model");
const PartOption = require("../models/partOption.model");
const mongoose = require("mongoose");

// Get all bicycles
exports.getBicycles = async (req, res) => {
  try {
    const bicycles = await Bicycle.find();
    res.json(bicycles);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch bicycles", error: err.message });
  }
};

// Create a new bicycle
exports.createBicycle = async (req, res) => {
  try {
    const { name, description, price, image, partOptions } = req.body;

    // Fetch part options details from database
    const detailedOptions = await PartOption.find({
      _id: { $in: partOptions },
    });

    if (detailedOptions.length !== partOptions.length) {
      return res.status(400).json({ message: "Some part options are invalid" });
    }

    const formattedOptions = detailedOptions.map((option) => ({
      category: option.category,
      values: [{ value: option.value, stock: option.stock }],
    }));

    const newBicycle = new Bicycle({
      name,
      description,
      price,
      image,
      options: formattedOptions,
      partOptions,
    });

    const savedBicycle = await newBicycle.save();
    res.status(201).json(savedBicycle);
  } catch (err) {
    console.error("Error creating bicycle:", err);
    res
      .status(500)
      .json({ message: "Failed to create bicycle", error: err.message });
  }
};

// Get a bicycle by ID
exports.getBicycleById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid bicycle ID" });
    }

    const bicycle = await Bicycle.findById(id);

    if (!bicycle) {
      return res.status(404).json({ message: "Bicycle not found" });
    }

    // Ensure values include stock information
    const optionsWithStock = bicycle.options.map((option) => ({
      category: option.category,
      values: Array.isArray(option.values)
        ? option.values
        : Object.values(option.values),
    }));

    res.status(200).json({ ...bicycle.toObject(), options: optionsWithStock });
  } catch (err) {
    console.error("Error fetching bicycle:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch bicycle", error: err.message });
  }
};

// Delete a bicycle by ID
exports.deleteBicycle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid bicycle ID" });
    }

    const deletedBicycle = await Bicycle.findByIdAndDelete(id);

    if (!deletedBicycle) {
      return res.status(404).json({ message: "Bicycle not found" });
    }

    res.status(200).json({ message: "Bicycle deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete bicycle", error: err.message });
  }
};
