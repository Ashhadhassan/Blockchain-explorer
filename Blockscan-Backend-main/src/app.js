/**
 * Express Application Configuration
 * Sets up middleware, routes, and error handling
 * @module app
 */

const express = require("express");
const cors = require("cors");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Import route modules
const walletRoutes = require("./routes/walletRoutes.js");
const blockRoutes = require("./routes/blockRoutes.js");
const tokenRoutes = require("./routes/tokenRoutes.js");
const validatorRoutes = require("./routes/validatorRoutes.js");
const searchRoutes = require("./routes/searchRoutes.js");
const transactionRoutes = require("./routes/transactionRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const p2pRoutes = require("./routes/p2pRoutes.js");
const emailRoutes = require("./routes/emailRoutes.js");
const marketRoutes = require("./routes/marketRoutes.js");

const app = express();

// ============================================================================
// Middleware Configuration
// ============================================================================

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// ============================================================================
// API Routes
// ============================================================================

app.use("/api/wallets", walletRoutes);
app.use("/api/blocks", blockRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/validators", validatorRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/p2p", p2pRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/market", marketRoutes);

// ============================================================================
// Health Check & Default Routes
// ============================================================================

app.get("/", (req, res) => {
  res.json({
    message: "Blockchain Explorer API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      wallets: "/api/wallets",
      blocks: "/api/blocks",
      tokens: "/api/tokens",
      validators: "/api/validators",
      transactions: "/api/transactions",
      users: "/api/users",
      p2p: "/api/p2p",
      search: "/api/search",
      email: "/api/email",
      market: "/api/market",
    },
  });
});

// ============================================================================
// Error Handling Middleware
// ============================================================================

// 404 handler for undefined routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
