/**
 * P2P Controller
 * Handles peer-to-peer trading operations including order management and transaction processing
 * @module p2pController
 */

const { pool } = require("../config/connectDB");
const asyncHandler = require("../utils/asyncHandler");
const crypto = require("crypto");

/**
 * Generate a random transaction hash
 * @returns {string} Transaction hash in format 0x[64 hex characters]
 */
const generateTxHash = () => `0x${crypto.randomBytes(32).toString("hex")}`;

// POST /api/p2p/orders - Create P2P order
const createOrder = asyncHandler(async (req, res) => {
  const { userId, tokenId, orderType, amount, price, paymentMethod, minLimit, maxLimit } = req.body;

  if (!userId || !tokenId || !orderType || !amount || !price) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!["buy", "sell"].includes(orderType)) {
    return res.status(400).json({ message: "Order type must be 'buy' or 'sell'" });
  }

  const total = amount * price;

  const result = await pool.query(
    `INSERT INTO p2p_orders (user_id, token_id, order_type, amount, price, total, payment_method, min_limit, max_limit, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
     RETURNING order_id, user_id, token_id, order_type, amount, price, total, payment_method, min_limit, max_limit, status, created_at`,
    [userId, tokenId, orderType, amount, price, total, paymentMethod || null, minLimit || null, maxLimit || null]
  );

  res.status(201).json({
    message: "P2P order created successfully",
    order: result.rows[0],
  });
});

// GET /api/p2p/orders - Get all P2P orders
// Uses p2p_order_summary view for comprehensive order data
const getOrders = asyncHandler(async (req, res) => {
  const { orderType, tokenId, status, limit = 50, offset = 0 } = req.query;

  // Use p2p_order_summary view
  let query = `
    SELECT 
      order_id,
      user_id,
      username,
      email,
      token_symbol,
      token_name,
      order_type,
      amount,
      price,
      total,
      payment_method,
      min_limit,
      max_limit,
      status,
      created_at,
      updated_at,
      completed_at,
      transaction_count
    FROM p2p_order_summary
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 1;

  if (orderType) {
    query += ` AND order_type = $${paramCount++}`;
    params.push(orderType);
  }

  if (tokenId) {
    query += ` AND token_id = $${paramCount++}`;
    params.push(tokenId);
  }

  if (status) {
    query += ` AND status = $${paramCount++}`;
    params.push(status);
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  params.push(Number(limit), Number(offset));

  const result = await pool.query(query, params);

  res.status(200).json({
    message: "P2P orders retrieved",
    orders: result.rows,
    pagination: {
      limit: Number(limit),
      offset: Number(offset),
      total: result.rows.length,
    },
  });
});

// GET /api/p2p/orders/:id - Get order details
// Uses p2p_order_summary view for comprehensive order data
const getOrderDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Use p2p_order_summary view
  const result = await pool.query(
    `SELECT 
      order_id,
      user_id,
      username,
      email,
      token_symbol,
      token_name,
      order_type,
      amount,
      price,
      total,
      payment_method,
      min_limit,
      max_limit,
      status,
      created_at,
      updated_at,
      completed_at,
      transaction_count
     FROM p2p_order_summary
     WHERE order_id = $1`,
    [id]
  );

  if (!result.rows.length) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.status(200).json({
    message: "Order details retrieved",
    order: result.rows[0],
  });
});

// POST /api/p2p/orders/:id/cancel - Cancel order
const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const order = await pool.query(
    `SELECT order_id, user_id, status FROM p2p_orders WHERE order_id = $1`,
    [id]
  );

  if (!order.rows.length) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.rows[0].user_id !== parseInt(userId)) {
    return res.status(403).json({ message: "Not authorized to cancel this order" });
  }

  if (order.rows[0].status !== "active") {
    return res.status(400).json({ message: "Order cannot be cancelled" });
  }

  await pool.query(
    `UPDATE p2p_orders SET status = 'cancelled', updated_at = NOW() WHERE order_id = $1`,
    [id]
  );

  res.status(200).json({
    message: "Order cancelled successfully",
  });
});

// GET /api/p2p/users-with-tokens - Get all users with their token holdings and selling prices
const getUsersWithTokens = asyncHandler(async (req, res) => {
  const query = `
    SELECT 
      u.user_id,
      u.username,
      u.full_name,
      u.email,
      u.email_verified,
      u.status AS user_status,
      w.wallet_id,
      w.address AS wallet_address,
      tok.token_id,
      tok.token_symbol,
      tok.token_name,
      tok.decimals,
      th.amount AS available_amount,
      COALESCE(po.price, tok.price_usd, 0) AS selling_price,
      po.order_id,
      po.payment_method,
      po.min_limit,
      po.max_limit
    FROM users u
    JOIN wallets w ON w.user_id = u.user_id
    JOIN token_holdings th ON th.wallet_id = w.wallet_id
    JOIN tokens tok ON th.token_id = tok.token_id
    LEFT JOIN p2p_orders po ON po.user_id = u.user_id 
      AND po.token_id = tok.token_id 
      AND po.order_type = 'sell' 
      AND po.status = 'active'
    WHERE u.status = 'active' AND th.amount > 0
    ORDER BY u.user_id, tok.token_symbol;
  `;

  const result = await pool.query(query);

  // Group by user
  const usersMap = new Map();
  result.rows.forEach((row) => {
    if (!usersMap.has(row.user_id)) {
      usersMap.set(row.user_id, {
        user_id: row.user_id,
        username: row.username,
        full_name: row.full_name,
        email: row.email,
        email_verified: row.email_verified,
        user_status: row.user_status,
        wallet_address: row.wallet_address,
        tokens: [],
      });
    }

    const user = usersMap.get(row.user_id);
    user.tokens.push({
      token_id: row.token_id,
      token_symbol: row.token_symbol,
      token_name: row.token_name,
      decimals: row.decimals,
      available_amount: parseFloat(row.available_amount),
      selling_price: parseFloat(row.selling_price),
      order_id: row.order_id,
      payment_method: row.payment_method,
      min_limit: row.min_limit ? parseFloat(row.min_limit) : null,
      max_limit: row.max_limit ? parseFloat(row.max_limit) : null,
    });
  });

  const users = Array.from(usersMap.values());

  res.status(200).json({
    message: "Users with tokens retrieved",
    users,
  });
});

// POST /api/p2p/transactions - Create P2P transaction request (requires seller acceptance)
const createP2PTransaction = asyncHandler(async (req, res) => {
  const { buyerId, sellerId, tokenId, amount, price } = req.body;

  if (!buyerId || !sellerId || !tokenId || !amount || !price) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (buyerId === sellerId) {
    return res.status(400).json({ message: "Cannot create transaction with yourself" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Verify seller has the token and sufficient balance
    const sellerBalance = await client.query(
      `SELECT th.amount, w.wallet_id 
       FROM token_holdings th
       JOIN wallets w ON th.wallet_id = w.wallet_id
       WHERE w.user_id = $1 AND th.token_id = $2`,
      [sellerId, tokenId]
    );

    if (!sellerBalance.rows.length || parseFloat(sellerBalance.rows[0].amount) < amount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Seller does not have sufficient balance" });
    }

    const total = amount * price;

    // Create P2P transaction request (status: 'pending' - waiting for seller acceptance)
    const txResult = await client.query(
      `INSERT INTO p2p_transactions (buyer_id, seller_id, token_id, amount, price, total, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING p2p_tx_id, buyer_id, seller_id, token_id, amount, price, total, status, created_at`,
      [buyerId, sellerId, tokenId, amount, price, total]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Transaction request created. Waiting for seller acceptance.",
      transaction: txResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

// GET /api/p2p/transactions - Get P2P transactions
const getP2PTransactions = asyncHandler(async (req, res) => {
  const { userId, status, limit = 50, offset = 0 } = req.query;

  let query = `
    SELECT 
      t.p2p_tx_id,
      t.order_id,
      t.buyer_id,
      buyer.username AS buyer_username,
      t.seller_id,
      seller.username AS seller_username,
      tok.token_symbol,
      tok.token_name,
      t.amount,
      t.price,
      t.total,
      t.status,
      t.payment_proof,
      t.created_at,
      t.updated_at
    FROM p2p_transactions t
    JOIN users buyer ON t.buyer_id = buyer.user_id
    JOIN users seller ON t.seller_id = seller.user_id
    JOIN tokens tok ON t.token_id = tok.token_id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 1;

  if (userId) {
    query += ` AND (t.buyer_id = $${paramCount} OR t.seller_id = $${paramCount})`;
    params.push(userId);
    paramCount++;
  }

  if (status) {
    query += ` AND t.status = $${paramCount++}`;
    params.push(status);
  }

  query += ` ORDER BY t.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  params.push(Number(limit), Number(offset));

  const result = await pool.query(query, params);

  res.status(200).json({
    message: "P2P transactions retrieved",
    transactions: result.rows,
  });
});

// POST /api/p2p/transactions/:id/accept - Seller accepts transaction request
const acceptTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get transaction
    const tx = await client.query(
      `SELECT p2p_tx_id, buyer_id, seller_id, token_id, amount, price, total, status 
       FROM p2p_transactions WHERE p2p_tx_id = $1`,
      [id]
    );

    if (!tx.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Transaction not found" });
    }

    const txData = tx.rows[0];

    // Verify user is the seller
    if (parseInt(txData.seller_id) !== parseInt(userId)) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Only the seller can accept this transaction" });
    }

    if (txData.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Transaction is not pending" });
    }

    // Verify seller still has balance
    const sellerBalance = await client.query(
      `SELECT th.amount, w.wallet_id 
       FROM token_holdings th
       JOIN wallets w ON th.wallet_id = w.wallet_id
       WHERE w.user_id = $1 AND th.token_id = $2`,
      [txData.seller_id, txData.token_id]
    );

    if (!sellerBalance.rows.length || parseFloat(sellerBalance.rows[0].amount) < parseFloat(txData.amount)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Update transaction status to 'paid' (seller accepted, waiting for payment)
    await client.query(
      `UPDATE p2p_transactions SET status = 'paid', updated_at = NOW() WHERE p2p_tx_id = $1`,
      [id]
    );

    await client.query("COMMIT");

    res.status(200).json({
      message: "Transaction accepted. Please complete the payment.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

// POST /api/p2p/transactions/:id/reject - Seller rejects transaction request
const rejectTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const tx = await pool.query(
    `SELECT seller_id, status FROM p2p_transactions WHERE p2p_tx_id = $1`,
    [id]
  );

  if (!tx.rows.length) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  if (parseInt(tx.rows[0].seller_id) !== parseInt(userId)) {
    return res.status(403).json({ message: "Only the seller can reject this transaction" });
  }

  if (tx.rows[0].status !== "pending") {
    return res.status(400).json({ message: "Transaction is not pending" });
  }

  await pool.query(
    `UPDATE p2p_transactions SET status = 'cancelled', updated_at = NOW() WHERE p2p_tx_id = $1`,
    [id]
  );

  res.status(200).json({
    message: "Transaction rejected",
  });
});

// PUT /api/p2p/transactions/:id/status - Update transaction status
const updateTransactionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, paymentProof, userId } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const validStatuses = ["pending", "paid", "completed", "disputed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  // Verify user is part of transaction
  const tx = await pool.query(
    `SELECT buyer_id, seller_id, status FROM p2p_transactions WHERE p2p_tx_id = $1`,
    [id]
  );

  if (!tx.rows.length) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  if (tx.rows[0].buyer_id !== parseInt(userId) && tx.rows[0].seller_id !== parseInt(userId)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const updates = [`status = $1`, `updated_at = NOW()`];
  const values = [status];
  let paramCount = 2;

  if (paymentProof) {
    updates.push(`payment_proof = $${paramCount++}`);
    values.push(paymentProof);
  }

  if (status === "completed") {
    updates.push(`email_notified = true`);
  }

  values.push(id);

  await pool.query(
    `UPDATE p2p_transactions SET ${updates.join(", ")} WHERE p2p_tx_id = $${paramCount}`,
    values
  );

  // If completed, create blockchain transaction and transfer tokens
  if (status === "completed") {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Get transaction details
      const completedTx = await client.query(
        `SELECT buyer_id, seller_id, token_id, amount FROM p2p_transactions WHERE p2p_tx_id = $1`,
        [id]
      );

      if (!completedTx.rows.length) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Transaction not found" });
      }

      const txData = completedTx.rows[0];

      // Get buyer and seller wallets
      const buyerWallet = await client.query(
        `SELECT wallet_id FROM wallets WHERE user_id = $1 LIMIT 1`,
        [txData.buyer_id]
      );

      const sellerWallet = await client.query(
        `SELECT wallet_id FROM wallets WHERE user_id = $1 LIMIT 1`,
        [txData.seller_id]
      );

      if (!buyerWallet.rows.length || !sellerWallet.rows.length) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Wallets not found" });
      }

      // Verify seller has balance
      const sellerBalance = await client.query(
        `SELECT amount FROM token_holdings WHERE wallet_id = $1 AND token_id = $2`,
        [sellerWallet.rows[0].wallet_id, txData.token_id]
      );

      if (!sellerBalance.rows.length || parseFloat(sellerBalance.rows[0].amount) < parseFloat(txData.amount)) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Insufficient seller balance" });
      }

      // Transfer tokens from seller to buyer
      await client.query(
        `UPDATE token_holdings SET amount = amount - $1 WHERE wallet_id = $2 AND token_id = $3`,
        [txData.amount, sellerWallet.rows[0].wallet_id, txData.token_id]
      );

      // Add tokens to buyer
      const buyerBalance = await client.query(
        `SELECT amount FROM token_holdings WHERE wallet_id = $1 AND token_id = $2`,
        [buyerWallet.rows[0].wallet_id, txData.token_id]
      );

      if (buyerBalance.rows.length) {
        await client.query(
          `UPDATE token_holdings SET amount = amount + $1 WHERE wallet_id = $2 AND token_id = $3`,
          [txData.amount, buyerWallet.rows[0].wallet_id, txData.token_id]
        );
      } else {
        await client.query(
          `INSERT INTO token_holdings (wallet_id, token_id, amount) VALUES ($1, $2, $3)`,
          [buyerWallet.rows[0].wallet_id, txData.token_id, txData.amount]
        );
      }

      // Create blockchain transaction
      const txHash = generateTxHash();
      const latestBlock = await client.query(
        "SELECT block_id FROM blocks ORDER BY timestamp DESC LIMIT 1"
      );
      const blockId = latestBlock.rows.length ? latestBlock.rows[0].block_id : null;

      await client.query(
        `INSERT INTO transactions (tx_hash, from_wallet_id, to_wallet_id, token_id, block_id, amount, fee, method, status, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'p2p', 'confirmed', NOW())`,
        [
          txHash,
          sellerWallet.rows[0].wallet_id,
          buyerWallet.rows[0].wallet_id,
          txData.token_id,
          blockId,
          txData.amount,
          txData.amount * 0.001,
        ]
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  res.status(200).json({
    message: "Transaction status updated successfully",
  });
});

module.exports = {
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
};

