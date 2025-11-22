// src/controllers/marketController.js
const { pool } = require("../config/connectDB");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/market/trading-pairs - Get all trading pairs
const getTradingPairs = asyncHandler(async (req, res) => {
  const query = `
    SELECT 
      t.token_id,
      t.token_symbol,
      t.token_name,
      t.price_usd,
      t.change_24h,
      t.volume_24h,
      t.market_cap_usd,
      t.total_supply,
      COUNT(DISTINCT th.wallet_id) AS holders_count
    FROM tokens t
    LEFT JOIN token_holdings th ON t.token_id = th.token_id
    GROUP BY t.token_id, t.token_symbol, t.token_name, t.price_usd, t.change_24h, t.volume_24h, t.market_cap_usd, t.total_supply
    ORDER BY t.market_cap_usd DESC;
  `;

  const result = await pool.query(query);

  res.status(200).json({
    message: "Trading pairs retrieved",
    pairs: result.rows,
  });
});

// GET /api/market/pair/:symbol - Get trading pair details
const getPairDetails = asyncHandler(async (req, res) => {
  const { symbol } = req.params;

  const query = `
    SELECT 
      t.token_id,
      t.token_symbol,
      t.token_name,
      t.decimals,
      t.price_usd,
      t.change_24h,
      t.volume_24h,
      t.market_cap_usd,
      t.total_supply,
      COUNT(DISTINCT th.wallet_id) AS holders_count,
      COUNT(DISTINCT tx.transaction_id) AS transactions_24h
    FROM tokens t
    LEFT JOIN token_holdings th ON t.token_id = th.token_id
    LEFT JOIN transactions tx ON t.token_id = tx.token_id AND tx.timestamp > NOW() - INTERVAL '24 hours'
    WHERE t.token_symbol = $1
    GROUP BY t.token_id, t.token_symbol, t.token_name, t.decimals, t.price_usd, t.change_24h, t.volume_24h, t.market_cap_usd, t.total_supply;
  `;

  const result = await pool.query(query, [symbol]);

  if (!result.rows.length) {
    return res.status(404).json({ message: "Trading pair not found" });
  }

  res.status(200).json({
    message: "Trading pair details retrieved",
    pair: result.rows[0],
  });
});

// GET /api/market/price-history/:symbol - Get price history for chart
const getPriceHistory = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { interval = "1h", limit = 100 } = req.query;

  // Generate dummy price history data based on current price
  const token = await pool.query(
    "SELECT token_id, price_usd FROM tokens WHERE token_symbol = $1",
    [symbol]
  );

  if (!token.rows.length) {
    return res.status(404).json({ message: "Token not found" });
  }

  const basePrice = parseFloat(token.rows[0].price_usd);
  const history = [];
  const now = new Date();

  for (let i = limit - 1; i >= 0; i--) {
    const timestamp = new Date(now);
    timestamp.setHours(timestamp.getHours() - i);
    
    // Generate realistic price variation
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const price = basePrice * (1 + variation);

    history.push({
      timestamp: timestamp.toISOString(),
      price: price.toFixed(8),
      volume: (Math.random() * 1000000).toFixed(2),
    });
  }

  res.status(200).json({
    message: "Price history retrieved",
    symbol,
    interval,
    history,
  });
});

// GET /api/market/orderbook/:symbol - Get order book
const getOrderBook = asyncHandler(async (req, res) => {
  const { symbol } = req.params;

  const token = await pool.query(
    "SELECT token_id FROM tokens WHERE token_symbol = $1",
    [symbol]
  );

  if (!token.rows.length) {
    return res.status(404).json({ message: "Token not found" });
  }

  const tokenId = token.rows[0].token_id;

  // Get buy orders
  const buyOrders = await pool.query(
    `SELECT 
      o.order_id,
      o.price,
      o.amount,
      o.total,
      u.username
    FROM p2p_orders o
    JOIN users u ON o.user_id = u.user_id
    WHERE o.token_id = $1 AND o.order_type = 'buy' AND o.status = 'active'
    ORDER BY o.price DESC
    LIMIT 20`,
    [tokenId]
  );

  // Get sell orders
  const sellOrders = await pool.query(
    `SELECT 
      o.order_id,
      o.price,
      o.amount,
      o.total,
      u.username
    FROM p2p_orders o
    JOIN users u ON o.user_id = u.user_id
    WHERE o.token_id = $1 AND o.order_type = 'sell' AND o.status = 'active'
    ORDER BY o.price ASC
    LIMIT 20`,
    [tokenId]
  );

  res.status(200).json({
    message: "Order book retrieved",
    symbol,
    buys: buyOrders.rows,
    sells: sellOrders.rows,
  });
});

module.exports = {
  getTradingPairs,
  getPairDetails,
  getPriceHistory,
  getOrderBook,
};

