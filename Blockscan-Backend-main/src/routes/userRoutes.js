// src/routes/userRoutes.js
const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  verifyEmail,
  resendVerification,
  requestDeleteAccount,
  confirmDeleteAccount,
} = require("../controllers/userController");

const router = express.Router();

// POST routes (specific)
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/request-delete-account", requestDeleteAccount);
router.post("/confirm-delete-account", confirmDeleteAccount);

// GET routes - specific before dynamic
router.get("/", getAllUsers);
// Dynamic routes must come last
router.get("/:id", getUserProfile);
router.put("/:id", updateUserProfile);

module.exports = router;

