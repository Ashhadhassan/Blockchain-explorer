// src/routes/validatorRoutes.js
const express = require("express");

const {
  getAllValidators,
  getValidatorDetails,
  getValidatorBlocks,
} = require("../controllers/ValidatorController.js");

const router = express.Router();

// Get all validators (must come before /:id route)
router.get("/", getAllValidators);
router.get("/:id", getValidatorDetails);
router.get("/:id/blocks", getValidatorBlocks);

module.exports = router;
