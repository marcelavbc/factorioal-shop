const PartOption = require("../models/partOption.model");

const validateCartItem = async (req, res, next) => {
  const { options } = req.body;

  try {
    // 🔥 Ensure `options` field exists
    if (!options) {
      return res
        .status(400)
        .json({ message: "Invalid request: options field is required." });
    }

    if (!Array.isArray(options) || options.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid request: options cannot be empty." });
    }

    for (const option of options) {
      // Find the selected option in the database
      const partOption = await PartOption.findOne({
        category: option.category,
        value: option.value,
      });

      if (!partOption) {
        return res.status(400).json({
          message: `Invalid selection: "${option.value}" is not a valid option for ${option.category}.`,
        });
      }

      if (partOption.stock === "out_of_stock") {
        return res.status(400).json({
          message: `Oops! "${option.value}" in ${option.category} is out of stock. Please choose another option.`,
        });
      }

      // 🔥 Check for **actual** restrictions
      if (
        partOption.restrictions &&
        Object.keys(partOption.restrictions).length > 0
      ) {
        for (const [restrictedCategory, restrictedValues] of Object.entries(
          partOption.restrictions
        )) {
          const selectedOption = options.find(
            (opt) => opt.category === restrictedCategory
          );

          if (
            selectedOption &&
            restrictedValues.includes(selectedOption.value)
          ) {
            return res.status(400).json({
              message: `🚫 "${option.value}" in ${option.category} is NOT compatible with "${selectedOption.value}" in ${restrictedCategory}. Please select a different ${restrictedCategory}.`,
            });
          }
        }
      }
    }

    next();
  } catch (err) {
    console.error("Error validating cart item:", err);
    res.status(500).json({ message: "Validation failed", error: err.message });
  }
};

module.exports = validateCartItem;
