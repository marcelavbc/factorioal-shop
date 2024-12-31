const express = require("express");
const {
  addOption,
  removeOption,
  toggleStock,
  updateRestrictions,
} = require("../controllers/partOption.controller");
const router = express.Router();

// Add a new part option
router.post("/", addOption);

// Remove a part option
router.delete("/:id", removeOption);

// Toggle stock status
router.patch("/:id/stock", toggleStock);

// Update compatibility rules
router.patch("/:id/restrictions", updateRestrictions);

module.exports = router;
