const express = require("express");
const {
  getBicycles,
  createBicycle,
  getBicycleById,
  deleteBicycle,
  updateBicycle,
} = require("../controllers/bicycle.controller");

const router = express.Router();

router.get("/", getBicycles); // Fetch all bicycles
router.post("/", createBicycle); // Create a new bicycle
router.get("/:id", getBicycleById); // Fetch a single bicycle by ID
router.delete("/:id", deleteBicycle); // Delete a bicycle by ID
router.put("/:id", updateBicycle); // Update bicycle by ID
module.exports = router;
