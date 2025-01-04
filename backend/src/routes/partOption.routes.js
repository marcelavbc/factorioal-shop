const express = require("express");
const {
  addOption,
  removeOption,
  getPartOptions,
  deletePartOption,
  updatePartOption,
  updateAllowedParts,
} = require("../controllers/partOption.controller");
const router = express.Router();

// Add a new part option
router.post("/", addOption);

// Remove a part option
router.delete("/:id", removeOption);

// Update a part option (category, value, or stock)
router.put("/:id", updatePartOption);

// Update compatibility rules
router.patch("/:id/allowed-parts", updateAllowedParts);

// Fetch all part options
router.get("/", getPartOptions);

// Delete a specific part option
router.delete("/:id", deletePartOption);

module.exports = router;
