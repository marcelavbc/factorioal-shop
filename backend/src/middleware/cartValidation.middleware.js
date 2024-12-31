const PartOption = require("../models/partOption.model");

const validateCartItem = async (req, res, next) => {
  const { options } = req.body;

  try {
    for (const option of options) {
      console.log("Validating Option:", option); // Log each option

      // Find the PartOption in the database
      const partOption = await PartOption.findOne({
        category: option.category.trim(),
        value: option.value.trim(),
      });

      console.log("PartOption Found:", partOption); // Log the result

      // If the PartOption does not exist, return an error
      if (!partOption) {
        return res.status(400).json({
          message: `Invalid option: ${option.category} - ${option.value}`,
        });
      }

      // If the PartOption is out of stock, return an error
      if (partOption.stock === "out_of_stock") {
        return res.status(400).json({
          message: `${option.category} option "${option.value}" is out of stock.`,
        });
      }

      // Check for restrictions
      if (partOption.restrictions) {
        for (const [
          restrictedCategory,
          restrictedValues,
        ] of partOption.restrictions) {
          const conflictingOption = options.find(
            (opt) =>
              opt.category === restrictedCategory &&
              restrictedValues.includes(opt.value)
          );

          if (conflictingOption) {
            return res.status(400).json({
              message: `Incompatible combination: ${option.category} "${option.value}" is not compatible with ${conflictingOption.category} "${conflictingOption.value}".`,
            });
          }
        }
      }
    }

    next(); // Validation passed
  } catch (err) {
    console.error("Error validating cart item:", err);
    res.status(500).json({ message: "Validation failed", error: err.message });
  }
};

module.exports = validateCartItem;
