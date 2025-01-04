const PartOption = require("../models/partOption.model");

const validateCartItem = async (req, res, next) => {
  const { options } = req.body;

  try {
    for (const option of options) {
      // Find the selected option in the database
      const partOption = await PartOption.findOne({
        category: option.category,
        value: option.value,
      });

      if (!partOption) {
        return res.status(400).json({
          message: `Invalid option: ${option.category} - ${option.value}`,
        });
      }

      if (partOption.stock === "out_of_stock") {
        return res.status(400).json({
          message: `${option.category} option "${option.value}" is out of stock.`,
        });
      }

      // 🔥 Check for allowedParts
      if (partOption.allowedParts) {
        for (const [allowedCategory, allowedValues] of Object.entries(
          partOption.allowedParts
        )) {
          const selectedOption = options.find(
            (opt) => opt.category === allowedCategory
          );

          if (selectedOption && !allowedValues.includes(selectedOption.value)) {
            return res.status(400).json({
              message: `Incompatible selection: ${option.category} "${
                option.value
              }" only allows ${allowedCategory} options: ${allowedValues.join(
                ", "
              )}. Your selection of "${selectedOption.value}" is not valid.`,
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
