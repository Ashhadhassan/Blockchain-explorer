// src/controllers/ValidatorController.js
const { pool } = require("../config/connectDB");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/validators
const getAllValidators = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 100;
  const offset = Number(req.query.offset) || 0;

  const query = `
    SELECT
      v.validator_id,
      v.validator_name,
      v.commission,
      v.total_stake,
      v.status,
      COUNT(b.block_id) AS total_blocks_produced,
      v.created_at
    FROM validators v
    LEFT JOIN blocks b ON b.validator_id = v.validator_id
    GROUP BY v.validator_id, v.validator_name, v.commission, v.total_stake, v.status, v.created_at
    ORDER BY v.total_stake DESC
    LIMIT $1 OFFSET $2;
  `;

  const result = await pool.query(query, [limit, offset]);

  res.status(200).json({
    message: "Validators retrieved",
    validators: result.rows,
  });
});

// GET /api/validators/:id
const getValidatorDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT
      v.validator_id,
      v.validator_name,
      v.commission,
      v.total_stake,
      v.status,
      COUNT(b.block_id) AS total_blocks_produced,
      v.created_at
    FROM validators v
    LEFT JOIN blocks b ON b.validator_id = v.validator_id
    WHERE v.validator_id = $1
    GROUP BY v.validator_id, v.validator_name, v.commission, v.total_stake, v.status, v.created_at;
  `;

  const result = await pool.query(query, [id]);

  if (!result.rows.length) {
    return res.status(404).json({ message: "Validator not found" });
  }

  res.status(200).json({
    message: "Validator details retrieved",
    validator: result.rows[0],
  });
});

// GET /api/validators/:id/blocks
const getValidatorBlocks = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      b.block_id,
      b.block_hash,
      b.previous_hash,
      v.validator_name,
      COUNT(t.transaction_id) AS total_transactions,
      b.timestamp
    FROM blocks b
    LEFT JOIN validators v ON b.validator_id = v.validator_id
    LEFT JOIN transactions t ON t.block_id = b.block_id
    WHERE b.validator_id = $1
    GROUP BY b.block_id, v.validator_name
    ORDER BY b.timestamp DESC;
  `;

  const result = await pool.query(query, [id]);

  res.status(200).json({
    message: "Validator blocks retrieved",
    blocks: result.rows,
  });
});

module.exports = {
  getAllValidators,
  getValidatorDetails,
  getValidatorBlocks,
};
