/**
 * User Routes
 * Defines all user-related API endpoints
 * @module userRoutes
 */

const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  verifyEmail,
  resendVerification,
  deleteAccount,
} = require("../controllers/userController");

const router = express.Router();

// ============================================================================
// Authentication Routes
// ============================================================================

router.post("/register", registerUser);
router.post("/login", loginUser);

// ============================================================================
// Email Verification Routes
// ============================================================================

router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

// ============================================================================
// Account Management Routes
// ============================================================================

router.post("/delete-account", deleteAccount);

// ============================================================================
// User Profile Routes
// ============================================================================

router.get("/", getAllUsers);
router.get("/:id", getUserProfile);
router.put("/:id", updateUserProfile);

module.exports = router;

