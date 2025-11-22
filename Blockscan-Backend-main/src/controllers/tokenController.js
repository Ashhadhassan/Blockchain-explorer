// src/controllers/tokenController.js
const { pool } = require("../config/connectDB");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/tokens/:symbol
const getTokenDetails = asyncHandler(async (req, res) => {
  const { symbol } = req.params;

  const query = `
    SELECT
      tok.token_id,
      tok.token_symbol,
      tok.token_name,
      tok.decimals,
      tok.total_supply,
      COUNT(DISTINCT th.wallet_id) AS total_holders,
      COALESCE(SUM(th.amount), 0) AS circulating_supply,
      tok.created_at
    FROM tokens tok
    LEFT JOIN token_holdings th ON th.token_id = tok.token_id
    WHERE tok.token_symbol = $1
    GROUP BY tok.token_id, tok.created_at;
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
const getAllTokens = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 100;
  const offset = Number(req.query.offset) || 0;

  const query = `
    SELECT
      tok.token_id,
      tok.token_symbol,
      tok.token_name,
      tok.decimals,
      tok.total_supply,
      tok.price_usd,
      tok.change_24h,
      tok.volume_24h,
      tok.market_cap_usd,
      COUNT(DISTINCT th.wallet_id) AS total_holders,
      COALESCE(SUM(th.amount), 0) AS circulating_supply,
      tok.created_at
    FROM tokens tok
    LEFT JOIN token_holdings th ON th.token_id = tok.token_id
    GROUP BY tok.token_id
    ORDER BY tok.market_cap_usd DESC NULLS LAST
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
