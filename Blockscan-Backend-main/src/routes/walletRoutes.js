/**
 * Wallet Routes
 * Defines all wallet-related API endpoints
 * @module walletRoutes
 */

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

// ============================================================================
// Wallet Management Routes
// ============================================================================

router.get("/", getAllWallets);
router.post("/", createWallet);

// ============================================================================
// Wallet Operation Routes (must come before GET /:address)
// ============================================================================

router.post("/:address/deposit", depositToWallet);
router.post("/:address/withdraw", withdrawFromWallet);
router.post("/:address/transfer", transferBetweenWallets);

// ============================================================================
// Wallet Query Routes (dynamic routes last)
// ============================================================================

router.get("/:address/holdings", getWalletHoldings);
router.get("/:address/transactions", getWalletTransactions);
router.get("/:address/balance", getWalletBalance);
router.get("/:address", getWalletDetails);

module.exports = router;