const express = require("express");
const {
  addOption,
  removeOption,
  getPartOptions,
  deletePartOption,
  updatePartOption,
  updateRestrictions,
} = require("../controllers/partOption.controller");
const router = express.Router();

router.post("/", addOption);

router.delete("/:id", removeOption);

router.put("/:id", updatePartOption);

router.patch("/:id/restrictions", updateRestrictions);

router.get("/", getPartOptions);

router.delete("/:id", deletePartOption);

module.exports = router;
