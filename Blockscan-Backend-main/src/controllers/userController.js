// src/controllers/userController.js
const { pool } = require("../config/connectDB");
const asyncHandler = require("../utils/asyncHandler");
const crypto = require("crypto");
const { sendVerificationEmail, sendResendVerificationEmail, sendDeleteAccountCode } = require("../utils/emailService");

// Generate verification token
const generateToken = () => crypto.randomBytes(32).toString("hex");

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// GET /api/users - Get all users (for P2P page)
const getAllUsers = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 100;
  const offset = Number(req.query.offset) || 0;

  const result = await pool.query(
    `SELECT user_id, username, email, full_name, phone, email_verified, status, created_at
     FROM users
     WHERE status = 'active'
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  res.status(200).json({
    message: "Users retrieved",
    users: result.rows,
  });
});

// POST /api/users/register
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, fullName, phone } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email, and password are required" });
  }

  // Check if user exists
  const existingUser = await pool.query(
    "SELECT user_id FROM users WHERE email = $1 OR username = $1",
    [email]
  );

  if (existingUser.rows.length > 0) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Generate verification token
  const verificationToken = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Create user (in production, hash password with bcrypt)
    const result = await client.query(
      `INSERT INTO users (username, email, password_hash, full_name, phone, verification_token, verification_expires)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING user_id, username, email, full_name, email_verified, status, created_at`,
      [username, email, password, fullName || null, phone || null, verificationToken, expiresAt]
    );

    const newUser = result.rows[0];

    // Create email verification record (ensure it's created)
    try {
      await client.query(
        `INSERT INTO email_verifications (user_id, email, token, type, expires_at)
         VALUES ($1, $2, $3, 'signup', $4)`,
        [newUser.user_id, email, verificationToken, expiresAt]
      );
    } catch (verificationError) {
      // If verification record creation fails, rollback user creation
      console.error("Error creating email verification record:", verificationError);
      await client.query("ROLLBACK");
      return res.status(500).json({ 
        message: "Failed to create verification record. Please try again.",
        error: verificationError.message 
      });
    }

    await client.query("COMMIT");

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, fullName);
    } catch (emailError) {
      // Log error but don't fail registration - email can be resent
      console.error("Failed to send verification email:", emailError);
      // In development, still return the token
      if (process.env.NODE_ENV !== "production") {
        console.log("Development mode: Verification token:", verificationToken);
      }
    }

    res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account.",
      user: newUser,
      // Only return token in development for testing
      ...(process.env.NODE_ENV !== "production" && { verificationToken }),
      verificationUrl: `/verify-email?token=${verificationToken}`,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Registration error:", error);
    throw error;
  } finally {
    client.release();
  }
});

// POST /api/users/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const result = await pool.query(
    `SELECT user_id, username, email, password_hash, full_name, phone, email_verified, status
     FROM users WHERE email = $1 OR username = $1`,
    [email]
  );

  if (!result.rows.length) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = result.rows[0];

  // In production, use bcrypt.compare
  if (user.password_hash !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.status !== "active") {
    return res.status(403).json({ message: "Account is not active" });
  }

  res.status(200).json({
    message: "Login successful",
    user: {
      id: user.user_id,
      userId: user.user_id, // Add this for API calls
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      emailVerified: user.email_verified,
      status: user.status,
    },
  });
});

// GET /api/users/:id
const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Ensure id is numeric
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  const result = await pool.query(
    `SELECT user_id, username, email, full_name, phone, email_verified, status, created_at
     FROM users WHERE user_id = $1`,
    [numericId]
  );

  if (!result.rows.length) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    message: "User profile retrieved",
    user: result.rows[0],
  });
});

// PUT /api/users/:id
const updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, phone } = req.body;

  // Ensure id is numeric
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  const updates = [];
  const values = [];
  let paramCount = 1;

  if (fullName !== undefined) {
    updates.push(`full_name = $${paramCount++}`);
    values.push(fullName);
  }

  if (phone !== undefined) {
    updates.push(`phone = $${paramCount++}`);
    values.push(phone);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  updates.push(`updated_at = NOW()`);
  values.push(numericId);

  const result = await pool.query(
    `UPDATE users SET ${updates.join(", ")} WHERE user_id = $${paramCount}
     RETURNING user_id, username, email, full_name, phone, email_verified, status`,
    values
  );

  if (!result.rows.length) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    message: "Profile updated successfully",
    user: result.rows[0],
  });
});

// POST /api/users/verify-email
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Verification token is required" });
  }

  // First, try to find in email_verifications table
  let verification = await pool.query(
    `SELECT verification_id, user_id, email, type, verified, expires_at
     FROM email_verifications WHERE token = $1`,
    [token]
  );

  // If not found in email_verifications, check users table (fallback for old registrations)
  if (!verification.rows.length) {
    const userVerification = await pool.query(
      `SELECT user_id, email, verification_token, verification_expires, email_verified
       FROM users WHERE verification_token = $1`,
      [token]
    );

    if (userVerification.rows.length > 0) {
      const user = userVerification.rows[0];
      
      // Check if already verified
      if (user.email_verified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // Check if expired
      if (user.verification_expires && new Date(user.verification_expires) < new Date()) {
        return res.status(400).json({ message: "Verification token has expired" });
      }

      // Create email_verifications record for this user (migration)
      const expiresAt = user.verification_expires || new Date(Date.now() + 24 * 60 * 60 * 1000);
      await pool.query(
        `INSERT INTO email_verifications (user_id, email, token, type, expires_at)
         VALUES ($1, $2, $3, 'signup', $4)
         ON CONFLICT (token) DO NOTHING`,
        [user.user_id, user.email, token, 'signup', expiresAt]
      );

      // Re-query to get the verification record
      verification = await pool.query(
        `SELECT verification_id, user_id, email, type, verified, expires_at
         FROM email_verifications WHERE token = $1`,
        [token]
      );
    }
  }

  if (!verification.rows.length) {
    return res.status(404).json({ message: "Invalid verification token" });
  }

  const ver = verification.rows[0];

  // Check if already verified - also check user's email_verified status
  if (ver.verified) {
    // Ensure user's email_verified status is also updated (fix inconsistency)
    const userCheck = await pool.query(
      `SELECT email_verified FROM users WHERE user_id = $1`,
      [ver.user_id]
    );
    
    if (userCheck.rows.length > 0 && !userCheck.rows[0].email_verified) {
      // Fix inconsistency: verification is marked but user isn't
      await pool.query(
        `UPDATE users SET email_verified = true WHERE user_id = $1`,
        [ver.user_id]
      );
    }
    
    return res.status(400).json({ message: "Email already verified" });
  }

  if (new Date(ver.expires_at) < new Date()) {
    return res.status(400).json({ message: "Verification token has expired" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update user email_verified status
    await client.query(
      `UPDATE users SET email_verified = true WHERE user_id = $1`,
      [ver.user_id]
    );

    // Mark verification as complete
    await client.query(
      `UPDATE email_verifications SET verified = true WHERE verification_id = $1`,
      [ver.verification_id]
    );

    // Check if user already has a wallet
    const existingWallet = await client.query(
      `SELECT wallet_id FROM wallets WHERE user_id = $1 LIMIT 1`,
      [ver.user_id]
    );

    // Create default wallet if user doesn't have one
    if (!existingWallet.rows.length) {
      const crypto = require("crypto");
      const address = `0x${crypto.randomBytes(20).toString("hex")}`;
      const publicKey = `0x${crypto.randomBytes(32).toString("hex")}`;
      
      // Get user info for wallet label
      const userInfo = await client.query(
        `SELECT username, full_name FROM users WHERE user_id = $1`,
        [ver.user_id]
      );
      const label = userInfo.rows[0]?.full_name 
        ? `${userInfo.rows[0].full_name}'s Wallet`
        : `${userInfo.rows[0]?.username || 'User'}'s Wallet`;

      await client.query(
        `INSERT INTO wallets (address, label, user_id, public_key, status, created_at)
         VALUES ($1, $2, $3, $4, 'active', NOW())`,
        [address, label, ver.user_id, publicKey]
      );
    }

    await client.query("COMMIT");

    res.status(200).json({
      message: "Email verified successfully. Wallet created automatically.",
      walletCreated: !existingWallet.rows.length,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

// POST /api/users/resend-verification
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await pool.query(
    `SELECT user_id, email, email_verified, full_name, username FROM users WHERE email = $1`,
    [email]
  );

  if (!user.rows.length) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.rows[0].email_verified) {
    return res.status(400).json({ message: "Email already verified" });
  }

  const verificationToken = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await pool.query(
    `INSERT INTO email_verifications (user_id, email, token, type, expires_at)
     VALUES ($1, $2, $3, 'signup', $4)`,
    [user.rows[0].user_id, email, verificationToken, expiresAt]
  );

  // Send verification email
  try {
    const userName = user.rows[0].full_name || user.rows[0].username || "User";
    await sendResendVerificationEmail(email, verificationToken, userName);
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
    // In development, still return the token
    if (process.env.NODE_ENV !== "production") {
      console.log("Development mode: Verification token:", verificationToken);
      const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      console.log("Development mode: Verification URL:", `${baseUrl}/verify-email?token=${verificationToken}`);
    }
  }

  res.status(200).json({
    message: "Verification email sent. Please check your inbox.",
    // Only return token in development for testing
    ...(process.env.NODE_ENV !== "production" && { verificationToken }),
  });
});

// POST /api/users/request-delete-account
const requestDeleteAccount = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  // Get user information
  const user = await pool.query(
    `SELECT user_id, email, full_name, username FROM users WHERE user_id = $1`,
    [userId]
  );

  if (!user.rows.length) {
    return res.status(404).json({ message: "User not found" });
  }

  const userData = user.rows[0];

  // Generate 6-digit verification code
  const verificationCode = generateVerificationCode();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiration

  // Store verification code in email_verifications table
  await pool.query(
    `INSERT INTO email_verifications (user_id, email, token, type, expires_at)
     VALUES ($1, $2, $3, 'account_deletion', $4)
     ON CONFLICT (token) DO UPDATE SET expires_at = $4, created_at = NOW()`,
    [userData.user_id, userData.email, verificationCode, expiresAt]
  );

  // Send verification code via email
  try {
    const userName = userData.full_name || userData.username || "User";
    await sendDeleteAccountCode(userData.email, verificationCode, userName);
  } catch (emailError) {
    console.error("Failed to send delete account verification email:", emailError);
    // In development, still return the code
    if (process.env.NODE_ENV !== "production") {
      console.log("Development mode: Delete Account Verification Code:", verificationCode);
    }
  }

  res.status(200).json({
    message: "Verification code sent to your email. Please check your inbox.",
    // Only return code in development for testing
    ...(process.env.NODE_ENV !== "production" && { verificationCode }),
  });
});

// POST /api/users/confirm-delete-account
const confirmDeleteAccount = asyncHandler(async (req, res) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ message: "User ID and verification code are required" });
  }

  // Verify the code
  const verification = await pool.query(
    `SELECT verification_id, user_id, email, expires_at, verified
     FROM email_verifications 
     WHERE user_id = $1 AND token = $2 AND type = 'account_deletion'
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId, code]
  );

  if (!verification.rows.length) {
    return res.status(400).json({ message: "Invalid verification code" });
  }

  const ver = verification.rows[0];

  // Check if code is expired
  if (new Date(ver.expires_at) < new Date()) {
    return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
  }

  // Check if already used
  if (ver.verified) {
    return res.status(400).json({ message: "This verification code has already been used" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Mark verification as used
    await client.query(
      `UPDATE email_verifications SET verified = true WHERE verification_id = $1`,
      [ver.verification_id]
    );

    // Delete user account (CASCADE will delete related wallets, token_holdings, etc.)
    await client.query(
      `DELETE FROM users WHERE user_id = $1`,
      [userId]
    );

    await client.query("COMMIT");

    res.status(200).json({
      message: "Account deleted successfully. All your data has been permanently removed.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting account:", error);
    throw error;
  } finally {
    client.release();
  }
});

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  verifyEmail,
  resendVerification,
  requestDeleteAccount,
  confirmDeleteAccount,
};
