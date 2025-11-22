// src/routes/blockRoutes.js
const express = require("express");

const {
  getLatestBlocks,
  getBlockDetails,
  getBlockTransactions,
} = require("../controllers/blockController");

const router = express.Router();

router.get("/latest", getLatestBlocks);
router.get("/:blockId", getBlockDetails);
router.get("/:blockId/transactions", getBlockTransactions);

module.exports = router;
