// src/controllers/blockController.js
const { pool } = require("../config/connectDB");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/blocks/latest
const getLatestBlocks = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;

  const query = `
    SELECT 
      b.block_id,
      b.block_hash,
      b.previous_hash,
      b.height,
      b.validator_id,
      v.validator_name,
      b.gas_used,
      b.gas_limit,
      b.size_kb,
      b.reward,
      b.status,
      b.timestamp,
      COUNT(t.transaction_id) AS total_transactions,
      COALESCE(
        ARRAY_AGG(t.transaction_id ORDER BY t.transaction_id) FILTER (WHERE t.transaction_id IS NOT NULL),
        ARRAY[]::INTEGER[]
      ) AS transaction_ids
    FROM blocks b
    LEFT JOIN validators v ON b.validator_id = v.validator_id
    LEFT JOIN transactions t ON t.block_id = b.block_id
    GROUP BY b.block_id, b.block_hash, b.previous_hash, b.height, b.validator_id, v.validator_name, 
             b.gas_used, b.gas_limit, b.size_kb, b.reward, b.status, b.timestamp
    ORDER BY b.timestamp DESC
    LIMIT $1;
  `;

  const result = await pool.query(query, [limit]);

  res.status(200).json({
    message: "Latest blocks retrieved",
    blocks: result.rows,
  });
});

// GET /api/blocks/:blockId
const getBlockDetails = asyncHandler(async (req, res) => {
  const { blockId } = req.params;

  const query = `
    SELECT 
      b.block_id,
      b.block_hash,
      b.previous_hash,
      b.height,
      b.validator_id,
      v.validator_name,
      b.gas_used,
      b.gas_limit,
      b.size_kb,
      b.reward,
      b.status,
      b.timestamp,
      COUNT(t.transaction_id) AS total_transactions,
      COALESCE(
        ARRAY_AGG(t.transaction_id ORDER BY t.transaction_id) FILTER (WHERE t.transaction_id IS NOT NULL),
        ARRAY[]::INTEGER[]
      ) AS transaction_ids
    FROM blocks b
    LEFT JOIN validators v ON b.validator_id = v.validator_id
    LEFT JOIN transactions t ON t.block_id = b.block_id
    WHERE b.block_id = $1
    GROUP BY b.block_id, b.block_hash, b.previous_hash, b.height, b.validator_id, v.validator_name, 
             b.gas_used, b.gas_limit, b.size_kb, b.reward, b.status, b.timestamp;
  `;

  const result = await pool.query(query, [blockId]);

  if (!result.rows.length) {
    return res.status(404).json({ message: "Block not found" });
  }

  res.status(200).json({
    message: "Block details retrieved",
    block: result.rows[0],
  });
});

// GET /api/blocks/:blockId/transactions
const getBlockTransactions = asyncHandler(async (req, res) => {
  const { blockId } = req.params;

  const query = `
    SELECT
      t.transaction_id,
      t.tx_hash,
      fw.address AS from_address,
      tw.address AS to_address,
      tok.token_symbol,
      tok.token_name,
      t.amount,
      t.fee,
      t.timestamp
    FROM transactions t
    LEFT JOIN wallets fw ON t.from_wallet_id = fw.wallet_id
    LEFT JOIN wallets tw ON t.to_wallet_id = tw.wallet_id
    LEFT JOIN tokens tok ON t.token_id = tok.token_id
    WHERE t.block_id = $1
    ORDER BY t.timestamp DESC;
  `;

  const result = await pool.query(query, [blockId]);

  res.status(200).json({
    message: "Block transactions retrieved",
    transactions: result.rows,
  });
});

module.exports = {
  getLatestBlocks,
  getBlockDetails,
  getBlockTransactions,
};
