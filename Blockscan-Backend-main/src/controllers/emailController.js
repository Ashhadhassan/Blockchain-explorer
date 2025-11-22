// src/controllers/emailController.js
const { pool } = require("../config/connectDB");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/email/notifications - Get email notifications for user
const getNotifications = asyncHandler(async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  const query = `
    SELECT 
      ev.verification_id,
      ev.type,
      ev.related_id,
      ev.verified,
      ev.created_at,
      t.tx_hash,
      t.amount,
      tok.token_symbol
    FROM email_verifications ev
    LEFT JOIN transactions t ON ev.type = 'transaction' AND ev.related_id = t.transaction_id
    LEFT JOIN tokens tok ON t.token_id = tok.token_id
    WHERE ev.user_id = $1 AND ev.verified = false
    ORDER BY ev.created_at DESC
    LIMIT 50;
  `;

  const result = await pool.query(query, [userId]);

  res.status(200).json({
    message: "Email notifications retrieved",
    notifications: result.rows,
  });
});

// POST /api/email/mark-read - Mark notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const { verificationId } = req.body;

  if (!verificationId) {
    return res.status(400).json({ message: "verificationId is required" });
  }

  await pool.query(
    `UPDATE email_verifications SET verified = true WHERE verification_id = $1`,
    [verificationId]
  );

  res.status(200).json({
    message: "Notification marked as read",
  });
});

module.exports = {
  getNotifications,
  markAsRead,
};

