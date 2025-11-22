// src/routes/walletRoutes.js
const express = require("express");

const {
  getWalletDetails,
  getWalletHoldings,
  getWalletTransactions,
  getAllWallets,
  createWallet,
  getWalletBalance,
  depositToWallet,
  withdrawFromWallet,
  transferBetweenWallets,
} = require("../controllers/walletController");

const router = express.Router();

// Specific routes first (before dynamic :address route)
router.get("/", getAllWallets);
router.post("/", createWallet);

// POST routes for wallet operations (must come before GET /:address)
router.post("/:address/deposit", depositToWallet);
router.post("/:address/withdraw", withdrawFromWallet);
router.post("/:address/transfer", transferBetweenWallets);

// GET routes for wallet details (dynamic routes last)
router.get("/:address/holdings", getWalletHoldings);
router.get("/:address/transactions", getWalletTransactions);
router.get("/:address/balance", getWalletBalance);
router.get("/:address", getWalletDetails);

module.exports = router;