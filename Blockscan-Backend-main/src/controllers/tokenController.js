// src/controllers/tokenController.js
const { pool } = require("../config/connectDB");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/tokens/:symbol
// Uses token_market_summary view for comprehensive token data
const getTokenDetails = asyncHandler(async (req, res) => {
  const { symbol } = req.params;

  // Use token_market_summary view
  const query = `
    SELECT
      token_id,
      token_symbol,
      token_name,
      price_usd,
      change_24h,
      volume_24h,
      market_cap_usd,
      total_supply,
      holder_count,
      transaction_count,
      circulating_supply,
      last_transaction_time
    FROM token_market_summary
    WHERE token_symbol = $1;
  `;

  const result = await pool.query(query, [symbol]);

  if (!result.rows.length) {
    return res.status(404).json({ message: "Token not found" });
  }

  res.status(200).json({
    message: "Token details retrieved",
    token: result.rows[0],
  });
});

// GET /api/tokens/:symbol/holders
const getTokenHolders = asyncHandler(async (req, res) => {
  const { symbol } = req.params;

  const query = `
    SELECT 
      w.address,
      tok.token_symbol,
      tok.token_name,
      tok.decimals,
      th.amount
    FROM token_holdings th
    JOIN wallets w ON th.wallet_id = w.wallet_id
    JOIN tokens tok ON th.token_id = tok.token_id
    WHERE tok.token_symbol = $1
    ORDER BY th.amount DESC;
  `;

  const result = await pool.query(query, [symbol]);

  res.status(200).json({
    message: "Token holders retrieved",
    holders: result.rows,
  });
});

// GET /api/tokens
// Uses token_market_summary view for comprehensive market data
const getAllTokens = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 100;
  const offset = Number(req.query.offset) || 0;

  // Use token_market_summary view
  const query = `
    SELECT
      token_id,
      token_symbol,
      token_name,
      price_usd,
      change_24h,
      volume_24h,
      market_cap_usd,
      total_supply,
      holder_count,
      transaction_count,
      circulating_supply,
      last_transaction_time
    FROM token_market_summary
    ORDER BY market_cap_usd DESC NULLS LAST
    LIMIT $1 OFFSET $2;
  `;

  const result = await pool.query(query, [limit, offset]);

  res.status(200).json({
    message: "Tokens retrieved",
    tokens: result.rows,
  });
});

module.exports = {
  getAllTokens,
  getTokenDetails,
  getTokenHolders,
};
