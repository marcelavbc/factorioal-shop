const express = require("express");
const {
  getBicycles,
  createBicycle,
  getBicycleById,
  deleteBicycle,
  updateBicycle,
} = require("../controllers/bicycle.controller");

const router = express.Router();

router.get("/", getBicycles);
router.post("/", createBicycle);
router.get("/:id", getBicycleById);
router.delete("/:id", deleteBicycle);
router.put("/:id", updateBicycle);
module.exports = router;
