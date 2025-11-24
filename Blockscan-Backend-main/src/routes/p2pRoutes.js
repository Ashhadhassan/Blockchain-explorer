/**
 * P2P Routes
 * Defines all peer-to-peer trading API endpoints
 * @module p2pRoutes
 */

const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderDetails,
  cancelOrder,
  getUsersWithTokens,
  createP2PTransaction,
  getP2PTransactions,
  acceptTransaction,
  rejectTransaction,
  updateTransactionStatus,
} = require("../controllers/p2pController");

const router = express.Router();

// ============================================================================
// P2P Order Routes
// ============================================================================

router.post("/orders", createOrder);
router.get("/orders", getOrders);
router.get("/orders/:id", getOrderDetails);
router.post("/orders/:id/cancel", cancelOrder);

// ============================================================================
// P2P User & Token Routes
// ============================================================================

router.get("/users-with-tokens", getUsersWithTokens);

// ============================================================================
// P2P Transaction Routes
// ============================================================================

router.post("/transactions", createP2PTransaction);
router.get("/transactions", getP2PTransactions);
router.post("/transactions/:id/accept", acceptTransaction);
router.post("/transactions/:id/reject", rejectTransaction);
router.put("/transactions/:id/status", updateTransactionStatus);

module.exports = router;

