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

// Create a new bicycle (with restriction validation)
exports.createBicycle = async (req, res) => {
  try {
    const { name, description, price, image, partOptions } = req.body;

    const detailedOptions = await PartOption.find({
      _id: { $in: partOptions },
    });

    if (detailedOptions.length !== partOptions.length) {
      return res.status(400).json({ message: "Some part options are invalid" });
    }

    // 🔥 Check for **restriction violations**
    for (const option of detailedOptions) {
      if (option.restrictions) {
        for (const [restrictedCategory, restrictedValues] of Object.entries(
          option.restrictions
        )) {
          const selectedOption = detailedOptions.find(
            (opt) => opt.category === restrictedCategory
          );

          if (
            selectedOption &&
            restrictedValues.includes(selectedOption.value)
          ) {
            return res.status(400).json({
              message: `🚫 "${option.value}" in ${option.category} is NOT compatible with "${selectedOption.value}" in ${restrictedCategory}.`,
            });
          }
        }
      }
    }

    // ✅ Format part options for bicycle schema
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

// Get a bicycle by ID (Ensuring Restrictions Are Present)
exports.getBicycleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid bicycle ID" });
    }

    const bicycle = await Bicycle.findById(id).populate("partOptions");

    if (!bicycle) {
      return res.status(404).json({ message: "Bicycle not found" });
    }

    // ✅ Group part options correctly
    const groupedOptions = bicycle.partOptions.reduce((acc, part) => {
      const existingCategory = acc.find(
        (opt) => opt.category === part.category
      );

      if (existingCategory) {
        existingCategory.values.push({
          value: part.value,
          stock: part.stock,
          restrictions: part.restrictions, // 🔥 Keep restrictions for frontend
        });
      } else {
        acc.push({
          category: part.category,
          values: [
            {
              value: part.value,
              stock: part.stock,
              restrictions: part.restrictions,
            },
          ],
        });
      }

      return acc;
    }, []);

    res.status(200).json({ ...bicycle.toObject(), options: groupedOptions });
  } catch (err) {
    console.error("❌ Error fetching bicycle:", err);
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

// Update an existing bicycle (with restriction validation)
exports.updateBicycle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid bicycle ID" });
    }

    const { name, description, price, image, partOptions } = req.body;

    // ✅ Ensure part options exist before updating
    const detailedOptions = await PartOption.find({
      _id: { $in: partOptions },
    });

    if (detailedOptions.length !== partOptions.length) {
      return res.status(400).json({ message: "Some part options are invalid" });
    }

    // 🔥 Check for **restriction violations**
    for (const option of detailedOptions) {
      if (option.restrictions) {
        for (const [restrictedCategory, restrictedValues] of Object.entries(
          option.restrictions
        )) {
          const selectedOption = detailedOptions.find(
            (opt) => opt.category === restrictedCategory
          );

          if (
            selectedOption &&
            restrictedValues.includes(selectedOption.value)
          ) {
            return res.status(400).json({
              message: `🚫 "${option.value}" in ${option.category} is NOT compatible with "${selectedOption.value}" in ${restrictedCategory}.`,
            });
          }
        }
      }
    }

    // ✅ Format part options
    const formattedOptions = detailedOptions.map((option) => ({
      category: option.category,
      values: [{ value: option.value, stock: option.stock }],
    }));

    const updatedBicycle = await Bicycle.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        image,
        options: formattedOptions,
        partOptions,
      },
      { new: true, runValidators: true }
    );

    if (!updatedBicycle) {
      return res.status(404).json({ message: "Bicycle not found" });
    }

    res.status(200).json(updatedBicycle);
  } catch (err) {
    console.error("❌ Error updating bicycle:", err);
    res
      .status(500)
      .json({ message: "Failed to update bicycle", error: err.message });
  }
};
