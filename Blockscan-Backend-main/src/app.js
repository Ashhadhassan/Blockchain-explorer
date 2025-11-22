// src/app.js
const express = require("express");
const cors = require("cors");

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


// Middlewares
app.use(cors());
app.use(express.json());

// Routes
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

// Default route
app.get("/", (req, res) => {
  res.send("SolScan Backend Running...");
});

module.exports = app;
