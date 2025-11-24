/**
 * Wallet Controller
 * Handles wallet operations including creation, balance queries, deposits, withdrawals, and transfers
 * @module walletController
 */

const { pool } = require("../config/connectDB");
const asyncHandler = require("../utils/asyncHandler");
const crypto = require("crypto");

/**
 * Generate a random wallet address
 * Creates a unique Ethereum-style address (0x + 40 hex characters)
 * @returns {string} Wallet address
 */
const generateAddress = () => `0x${crypto.randomBytes(20).toString("hex")}`;

// GET /api/wallets
const getAllWallets = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 100;
  const offset = Number(req.query.offset) || 0;
  const userId = req.query.userId;

  // Use wallet_summary view for comprehensive wallet data
  let query = `
    SELECT 
      wallet_id,
      address,
      label,
      user_id,
      username,
      email,
      wallet_status as status,
      token_count,
      total_tokens,
      total_balance_usd,
      created_at
    FROM wallet_summary
  `;

  const params = [];
  if (userId) {
    query += ` WHERE user_id = $1`;
    params.push(userId);
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  res.status(200).json({
    message: "Wallets retrieved",
    wallets: result.rows,
  });
});

// POST /api/wallets
const createWallet = asyncHandler(async (req, res) => {
  const { label, userId } = req.body;

  if (!label || !userId) {
    return res.status(400).json({ message: "Label and userId are required" });
  }

  // Verify user exists
  const userCheck = await pool.query("SELECT user_id FROM users WHERE user_id = $1", [userId]);
  if (!userCheck.rows.length) {
    return res.status(404).json({ message: "User not found" });
  }

  const address = generateAddress();
  const publicKey = `0x${crypto.randomBytes(32).toString("hex")}`;

  const result = await pool.query(
    `INSERT INTO wallets (address, label, user_id, public_key, status, created_at)
     VALUES ($1, $2, $3, $4, 'active', NOW())
     RETURNING wallet_id, address, label, user_id, status, created_at`,
    [address, label, userId, publicKey]
  );

  res.status(201).json({
    message: "Wallet created successfully",
    wallet: result.rows[0],
  });
});

// GET /api/wallets/:address/balance
const getWalletBalance = asyncHandler(async (req, res) => {
  const { address } = req.params;
  const { tokenSymbol } = req.query;

  // First get wallet_id from address
  const wallet = await pool.query("SELECT wallet_id FROM wallets WHERE address = $1", [address]);
  
  if (!wallet.rows.length) {
    return res.status(404).json({ message: "Wallet not found" });
  }

  const walletId = wallet.rows[0].wallet_id;

  // If tokenSymbol provided, use function to get balance
  if (tokenSymbol) {
    const token = await pool.query("SELECT token_id, token_name, decimals FROM tokens WHERE token_symbol = $1", [tokenSymbol]);
    if (!token.rows.length) {
      return res.status(404).json({ message: "Token not found" });
    }
    
    // Use get_wallet_balance function
    const balanceResult = await pool.query(
      "SELECT get_wallet_balance($1, $2) as amount",
      [walletId, token.rows[0].token_id]
    );
    
    return res.status(200).json({
      message: "Wallet balance retrieved",
      balances: [{
        address,
        token_id: token.rows[0].token_id,
        token_symbol: tokenSymbol,
        token_name: token.rows[0].token_name,
        decimals: token.rows[0].decimals,
        amount: parseFloat(balanceResult.rows[0].amount)
      }],
    });
  }

  // Otherwise, get all balances using standard query
  const query = `
    SELECT 
      w.address,
      tok.token_id,
      tok.token_symbol,
      tok.token_name,
      tok.decimals,
      th.amount,
      COALESCE(tok.price_usd, 0) AS price_usd
    FROM wallets w
    JOIN token_holdings th ON th.wallet_id = w.wallet_id
    JOIN tokens tok ON th.token_id = tok.token_id
    WHERE w.address = $1
    ORDER BY tok.token_symbol
  `;

  const result = await pool.query(query, [address]);

  res.status(200).json({
    message: "Wallet balance retrieved",
    balances: result.rows,
  });
});

// GET /api/wallets/:address
const getWalletDetails = asyncHandler(async (req, res) => {
  const { address } = req.params;

  // Get wallet basic info (need public_key from base table, not in view)
  const walletQuery = `
    SELECT 
      w.wallet_id,
      w.address,
      w.label,
      w.public_key,
      u.username,
      u.user_id,
      w.status,
      w.created_at,
      (
        SELECT COUNT(*) 
        FROM transactions t
        WHERE t.from_wallet_id = w.wallet_id 
           OR t.to_wallet_id = w.wallet_id
      ) AS total_transactions
    FROM wallets w
    LEFT JOIN users u ON w.user_id = u.user_id
    WHERE w.address = $1;
  `;

  const walletResult = await pool.query(walletQuery, [address]);

  if (!walletResult.rows.length) {
    return res.status(404).json({ message: "Wallet not found" });
  }

  const wallet = walletResult.rows[0];

  // Get token holdings
  const holdingsQuery = `
    SELECT 
      th.token_id,
      th.amount,
      tok.token_symbol,
      tok.token_name,
      tok.decimals,
      tok.price_usd
    FROM token_holdings th
    JOIN tokens tok ON th.token_id = tok.token_id
    WHERE th.wallet_id = $1
    ORDER BY th.amount DESC;
  `;

  const holdingsResult = await pool.query(holdingsQuery, [wallet.wallet_id]);

  // Get summary from view for additional stats
  const summaryResult = await pool.query(
    `SELECT token_count, total_tokens, total_balance_usd 
     FROM wallet_summary WHERE wallet_id = $1`,
    [wallet.wallet_id]
  );

  res.status(200).json({
    message: "Wallet details retrieved",
    wallet: {
      ...wallet,
      holdings: holdingsResult.rows,
      summary: summaryResult.rows[0] || null,
    },
  });
});

// GET /api/wallets/:address/holdings
const getWalletHoldings = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const query = `
    SELECT 
      w.address,
      tok.token_id,
      tok.token_symbol,
      tok.token_name,
      tok.decimals,
      th.amount,
      COALESCE(tok.price_usd, 0) AS price_usd
    FROM token_holdings th
    JOIN wallets w ON th.wallet_id = w.wallet_id
    JOIN tokens tok ON th.token_id = tok.token_id
    WHERE w.address = $1
    ORDER BY tok.token_symbol;
  `;

  const result = await pool.query(query, [address]);

  res.status(200).json({
    message: "Wallet holdings retrieved",
    holdings: result.rows,
  });
});

// GET /api/wallets/:address/transactions
const getWalletTransactions = asyncHandler(async (req, res) => {
  const { address } = req.params;
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;

  const query = `
    SELECT
      t.transaction_id,
      t.tx_hash,
      fw.address AS from_address,
      tw.address AS to_address,
      b.block_hash,
      tok.token_symbol,
      tok.token_name,
      t.amount,
      t.fee,
      t.method,
      t.status,
      t.timestamp
    FROM transactions t
    LEFT JOIN wallets fw ON t.from_wallet_id = fw.wallet_id
    LEFT JOIN wallets tw ON t.to_wallet_id = tw.wallet_id
    LEFT JOIN blocks b ON t.block_id = b.block_id
    LEFT JOIN tokens tok ON t.token_id = tok.token_id
    WHERE (fw.address = $1 OR tw.address = $1)
    ORDER BY t.timestamp DESC
    LIMIT $2 OFFSET $3;
  `;

  const result = await pool.query(query, [address, limit, offset]);

  res.status(200).json({
    message: "Wallet transactions retrieved",
    transactions: result.rows,
  });
});

// POST /api/wallets/:address/deposit - Deposit tokens to wallet
const depositToWallet = asyncHandler(async (req, res) => {
  const { address } = req.params;
  const { tokenId, amount } = req.body;

  // Convert tokenId to integer if it's a string
  const tokenIdInt = typeof tokenId === 'string' ? parseInt(tokenId, 10) : tokenId;
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (!tokenIdInt || isNaN(tokenIdInt) || !amountNum || amountNum <= 0 || isNaN(amountNum)) {
    return res.status(400).json({ message: "Token ID and valid amount are required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get wallet
    const wallet = await client.query("SELECT wallet_id FROM wallets WHERE address = $1", [address]);
    if (!wallet.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Wallet not found" });
    }

    const walletId = wallet.rows[0].wallet_id;

    // Check if holding exists
    const existing = await client.query(
      "SELECT holding_id, amount FROM token_holdings WHERE wallet_id = $1 AND token_id = $2",
      [walletId, tokenIdInt]
    );

    if (existing.rows.length) {
      // Update existing holding
      await client.query(
        "UPDATE token_holdings SET amount = amount + $1 WHERE holding_id = $2",
        [amountNum, existing.rows[0].holding_id]
      );
    } else {
      // Create new holding
      await client.query(
        "INSERT INTO token_holdings (wallet_id, token_id, amount) VALUES ($1, $2, $3)",
        [walletId, tokenIdInt, amountNum]
      );
    }

    await client.query("COMMIT");

    res.status(200).json({
      message: "Deposit successful",
      amount: amountNum,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

// POST /api/wallets/:address/withdraw - Withdraw tokens from wallet
const withdrawFromWallet = asyncHandler(async (req, res) => {
  const { address } = req.params;
  const { tokenId, amount, toAddress } = req.body;

  // Convert tokenId to integer if it's a string
  const tokenIdInt = typeof tokenId === 'string' ? parseInt(tokenId, 10) : tokenId;
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (!tokenIdInt || isNaN(tokenIdInt) || !amountNum || amountNum <= 0 || isNaN(amountNum)) {
    return res.status(400).json({ message: "Token ID and valid amount are required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get wallet
    const wallet = await client.query("SELECT wallet_id FROM wallets WHERE address = $1", [address]);
    if (!wallet.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Wallet not found" });
    }

    const walletId = wallet.rows[0].wallet_id;

    // Check balance
    const holding = await client.query(
      "SELECT amount FROM token_holdings WHERE wallet_id = $1 AND token_id = $2",
      [walletId, tokenIdInt]
    );

    if (!holding.rows.length || parseFloat(holding.rows[0].amount) < amountNum) {
      await client.query("ROLLBACK");
      return res.status(400).json({ 
        message: "Insufficient balance",
        available: holding.rows.length ? parseFloat(holding.rows[0].amount) : 0,
        requested: amountNum
      });
    }

    // Deduct from wallet
    await client.query(
      "UPDATE token_holdings SET amount = amount - $1 WHERE wallet_id = $2 AND token_id = $3",
      [amountNum, walletId, tokenIdInt]
    );

    // If toAddress provided, create transaction
    if (toAddress) {
      const toWallet = await client.query("SELECT wallet_id FROM wallets WHERE address = $1", [toAddress]);
      if (toWallet.rows.length) {
        const txHash = `0x${crypto.randomBytes(32).toString("hex")}`;
        const latestBlock = await client.query("SELECT block_id FROM blocks ORDER BY timestamp DESC LIMIT 1");
        const blockId = latestBlock.rows.length ? latestBlock.rows[0].block_id : null;

        await client.query(
          `INSERT INTO transactions (tx_hash, from_wallet_id, to_wallet_id, token_id, block_id, amount, fee, method, status, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'withdraw', 'confirmed', NOW())`,
          [txHash, walletId, toWallet.rows[0].wallet_id, tokenIdInt, blockId, amountNum, amountNum * 0.001]
        );
      }
    }

    await client.query("COMMIT");

    res.status(200).json({
      message: "Withdrawal successful",
      amount: amountNum,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

// POST /api/wallets/:address/transfer - Transfer between wallets
const transferBetweenWallets = asyncHandler(async (req, res) => {
  const { address } = req.params;
  const { toAddress, tokenId, amount } = req.body;

  if (!toAddress || !tokenId || !amount || amount <= 0) {
    return res.status(400).json({ message: "To address, token ID, and valid amount are required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get wallets
    const fromWallet = await client.query("SELECT wallet_id FROM wallets WHERE address = $1", [address]);
    const toWallet = await client.query("SELECT wallet_id FROM wallets WHERE address = $1", [toAddress]);

    if (!fromWallet.rows.length || !toWallet.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Wallet not found" });
    }

    const fromWalletId = fromWallet.rows[0].wallet_id;
    const toWalletId = toWallet.rows[0].wallet_id;

    // Check balance
    const holding = await client.query(
      "SELECT amount FROM token_holdings WHERE wallet_id = $1 AND token_id = $2",
      [fromWalletId, tokenId]
    );

    if (!holding.rows.length || parseFloat(holding.rows[0].amount) < amount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct from sender
    await client.query(
      "UPDATE token_holdings SET amount = amount - $1 WHERE wallet_id = $2 AND token_id = $3",
      [amount, fromWalletId, tokenId]
    );

    // Add to receiver
    const toHolding = await client.query(
      "SELECT holding_id FROM token_holdings WHERE wallet_id = $1 AND token_id = $2",
      [toWalletId, tokenId]
    );

    if (toHolding.rows.length) {
      await client.query(
        "UPDATE token_holdings SET amount = amount + $1 WHERE holding_id = $2",
        [amount, toHolding.rows[0].holding_id]
      );
    } else {
      await client.query(
        "INSERT INTO token_holdings (wallet_id, token_id, amount) VALUES ($1, $2, $3)",
        [toWalletId, tokenId, amount]
      );
    }

    // Create transaction
    const txHash = `0x${crypto.randomBytes(32).toString("hex")}`;
    const latestBlock = await client.query("SELECT block_id FROM blocks ORDER BY timestamp DESC LIMIT 1");
    const blockId = latestBlock.rows.length ? latestBlock.rows[0].block_id : null;

    await client.query(
      `INSERT INTO transactions (tx_hash, from_wallet_id, to_wallet_id, token_id, block_id, amount, fee, method, status, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'transfer', 'confirmed', NOW())`,
      [txHash, fromWalletId, toWalletId, tokenId, blockId, amount, amount * 0.001]
    );

    await client.query("COMMIT");

    res.status(200).json({
      message: "Transfer successful",
      transactionHash: txHash,
      amount,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

module.exports = {
  getAllWallets,
  createWallet,
  getWalletDetails,
  getWalletHoldings,
  getWalletTransactions,
  getWalletBalance,
  depositToWallet,
  withdrawFromWallet,
  transferBetweenWallets,
};
