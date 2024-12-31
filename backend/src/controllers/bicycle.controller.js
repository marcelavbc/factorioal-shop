const Bicycle = require("../models/bicycle.model");
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
    const { name, description, price, image, options } = req.body;
    const newBicycle = new Bicycle({
      name,
      description,
      price,
      image,
      options,
    });
    const savedBicycle = await newBicycle.save();
    res.status(201).json(savedBicycle);
  } catch (err) {
    res
      .status(400)
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

    res.status(200).json(bicycle);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch bicycle", error: err.message });
  }
};

// Delete a bicycle by ID
exports.deleteBicycle = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID format
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
