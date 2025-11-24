/**
 * Transaction Routes
 * Defines all transaction-related API endpoints
 * @module transactionRoutes
 */

const express = require("express");
const {
  createTransaction,
  getAllTransactions,
  getTransactionDetails,
} = require("../controllers/transactionController");

const router = express.Router();

// ============================================================================
// Transaction Routes
// ============================================================================

router.post("/", createTransaction);
router.get("/", getAllTransactions);
router.get("/:txHash", getTransactionDetails);

module.exports = router;

