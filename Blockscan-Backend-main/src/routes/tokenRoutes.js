// src/routes/tokenRoutes.js
const express = require("express");

const {
  getAllTokens,
  getTokenDetails,
  getTokenHolders,
} = require("../controllers/tokenController");

const router = express.Router();

router.get("/", getAllTokens);
router.get("/:symbol", getTokenDetails);
router.get("/:symbol/holders", getTokenHolders);

module.exports = router;
