/**
 * Transaction Controller
 * Handles all transaction-related operations including creation, retrieval, and details
 * @module transactionController
 */

const { pool } = require("../config/connectDB");
const asyncHandler = require("../utils/asyncHandler");
const crypto = require("crypto");

/**
 * Generate a random transaction hash
 * Creates a unique hexadecimal hash for blockchain transactions
 * @returns {string} Transaction hash in format 0x[64 hex characters]
 */
const generateTxHash = () => `0x${crypto.randomBytes(32).toString("hex")}`;

/**
 * Create a new blockchain transaction
 * POST /api/transactions
 * 
 * Transfers tokens from one wallet to another with balance validation
 * Creates transaction record, updates token holdings, and generates email notifications
 * 
 * @param {string} fromAddress - Sender wallet address
 * @param {string} toAddress - Receiver wallet address
 * @param {string} tokenSymbol - Token symbol to transfer
 * @param {number} amount - Amount to transfer
 * @param {string} method - Transaction method (default: "transfer")
 * 
 * @returns {Object} Created transaction details
 */
const createTransaction = asyncHandler(async (req, res) => {
  const { fromAddress, toAddress, tokenSymbol, amount, method = "transfer" } = req.body;

  // Validate required fields
  if (!fromAddress || !toAddress || !tokenSymbol || !amount || amount <= 0) {
    return res.status(400).json({ 
      success: false,
      message: "Missing required fields: fromAddress, toAddress, tokenSymbol, and amount are required" 
    });
  }

  // Start database transaction for atomicity
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Validate and get wallet IDs
    const fromWallet = await client.query("SELECT wallet_id FROM wallets WHERE address = $1", [fromAddress]);
    const toWallet = await client.query("SELECT wallet_id FROM wallets WHERE address = $1", [toAddress]);

    if (!fromWallet.rows.length || !toWallet.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ 
        success: false,
        message: "One or both wallets not found" 
      });
    }

    const fromWalletId = fromWallet.rows[0].wallet_id;
    const toWalletId = toWallet.rows[0].wallet_id;

    // Validate token exists
    const token = await client.query("SELECT token_id FROM tokens WHERE token_symbol = $1", [tokenSymbol]);
    if (!token.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ 
        success: false,
        message: `Token with symbol '${tokenSymbol}' not found` 
      });
    }
    const tokenId = token.rows[0].token_id;

    // Validate sender has sufficient balance using database function
    const fee = amount * 0.001; // 0.1% transaction fee
    const totalRequired = amount + fee;
    
    // Use validate_wallet_balance function
    const balanceCheck = await client.query(
      "SELECT validate_wallet_balance($1, $2, $3) as has_sufficient_balance, get_wallet_balance($1, $2) as current_balance",
      [fromWalletId, tokenId, totalRequired]
    );

    if (!balanceCheck.rows[0].has_sufficient_balance) {
      await client.query("ROLLBACK");
      return res.status(400).json({ 
        success: false,
        message: "Insufficient balance",
        available: parseFloat(balanceCheck.rows[0].current_balance),
        required: totalRequired
      });
    }

    // Get latest block for transaction association
    const latestBlock = await client.query(
      "SELECT block_id FROM blocks ORDER BY timestamp DESC LIMIT 1"
    );
    const blockId = latestBlock.rows.length ? latestBlock.rows[0].block_id : null;

    // Generate unique transaction hash
    const txHash = generateTxHash();

    const txResult = await client.query(
      `INSERT INTO transactions (tx_hash, from_wallet_id, to_wallet_id, token_id, block_id, amount, fee, method, status, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING transaction_id, tx_hash, amount, fee, timestamp, status`,
      [txHash, fromWalletId, toWalletId, tokenId, blockId, amount, fee, method, "pending"]
    );

    // Update token balances
    // Deduct amount + fee from sender
    await client.query(
      `UPDATE token_holdings SET amount = amount - $1 
       WHERE wallet_id = $2 AND token_id = $3`,
      [totalRequired, fromWalletId, tokenId]
    );

    // Add to receiver
    const receiverBalance = await client.query(
      `SELECT amount FROM token_holdings 
       WHERE wallet_id = $1 AND token_id = $2`,
      [toWalletId, tokenId]
    );

    if (receiverBalance.rows.length) {
      await client.query(
        `UPDATE token_holdings SET amount = amount + $1 
         WHERE wallet_id = $2 AND token_id = $3`,
        [amount, toWalletId, tokenId]
      );
    } else {
      await client.query(
        `INSERT INTO token_holdings (wallet_id, token_id, amount)
         VALUES ($1, $2, $3)`,
        [toWalletId, tokenId, amount]
      );
    }

    // Update transaction status to confirmed
    await client.query(
      `UPDATE transactions SET status = 'confirmed', email_notified = true WHERE transaction_id = $1`,
      [txResult.rows[0].transaction_id]
    );

    // Create email verification records for transaction notifications
    const buyerUser = await client.query(
      "SELECT user_id, email FROM users WHERE user_id = (SELECT user_id FROM wallets WHERE wallet_id = $1)", 
      [toWalletId]
    );
    const sellerUser = await client.query(
      "SELECT user_id, email FROM users WHERE user_id = (SELECT user_id FROM wallets WHERE wallet_id = $1)", 
      [fromWalletId]
    );
    
    if (buyerUser.rows.length) {
      const verificationToken = `0x${crypto.randomBytes(16).toString("hex")}`;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      await client.query(
        `INSERT INTO email_verifications (user_id, email, token, type, related_id, expires_at)
         VALUES ($1, $2, $3, 'transaction', $4, $5)`,
        [buyerUser.rows[0].user_id, buyerUser.rows[0].email, verificationToken, txResult.rows[0].transaction_id, expiresAt]
      );
    }
    
    if (sellerUser.rows.length) {
      const verificationToken = `0x${crypto.randomBytes(16).toString("hex")}`;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      await client.query(
        `INSERT INTO email_verifications (user_id, email, token, type, related_id, expires_at)
         VALUES ($1, $2, $3, 'transaction', $4, $5)`,
        [sellerUser.rows[0].user_id, sellerUser.rows[0].email, verificationToken, txResult.rows[0].transaction_id, expiresAt]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction: {
        ...txResult.rows[0],
        status: "confirmed",
        fee: fee,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

/**
 * Get all transactions with pagination
 * GET /api/transactions
 * 
 * Uses transaction_history view for comprehensive transaction data
 * 
 * @param {number} limit - Number of transactions to return (default: 50)
 * @param {number} offset - Number of transactions to skip (default: 0)
 * 
 * @returns {Object} List of transactions with pagination info
 */
const getAllTransactions = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 50;
  const offset = Number(req.query.offset) || 0;

  // Use transaction_history view for comprehensive data
  const query = `
    SELECT
      transaction_id,
      tx_hash,
      from_address,
      to_address,
      from_username,
      to_username,
      token_symbol,
      token_name,
      token_price,
      amount,
      fee,
      method,
      status,
      timestamp,
      email_notified,
      block_hash,
      block_height,
      block_timestamp
    FROM transaction_history
    LIMIT $1 OFFSET $2;
  `;

  const result = await pool.query(query, [limit, offset]);

  res.status(200).json({
    success: true,
    message: "Transactions retrieved successfully",
    transactions: result.rows,
    pagination: {
      limit,
      offset,
      count: result.rows.length,
    },
  });
});

/**
 * Get transaction details by transaction hash
 * GET /api/transactions/:txHash
 * 
 * Uses transaction_history view for comprehensive transaction data
 * 
 * @param {string} txHash - Transaction hash
 * 
 * @returns {Object} Transaction details including wallet and token information
 */
const getTransactionDetails = asyncHandler(async (req, res) => {
  const { txHash } = req.params;

  // Use transaction_history view
  const query = `
    SELECT
      transaction_id,
      tx_hash,
      from_address,
      from_label,
      from_username,
      to_address,
      to_label,
      to_username,
      token_symbol,
      token_name,
      token_price,
      amount,
      fee,
      method,
      status,
      timestamp,
      email_notified,
      block_hash,
      block_height,
      block_timestamp
    FROM transaction_history
    WHERE tx_hash = $1;
  `;

  const result = await pool.query(query, [txHash]);

  if (!result.rows.length) {
    return res.status(404).json({ 
      success: false,
      message: "Transaction not found" 
    });
  }

  res.status(200).json({
    success: true,
    message: "Transaction details retrieved successfully",
    transaction: result.rows[0],
  });
});

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionDetails,
};

