import express from "express";
import {
  changePassword,
  loginUser,
  registerUser,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../controller/authController.js";
import { authMiddleware } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// Change password route (protected)
router.post("/change-password", authMiddleware, changePassword);

// Refresh token route
router.post("/refresh-token", refreshToken);

// Forgot password - request reset
router.post("/forgot-password", forgotPassword);

// Reset password with token
router.post("/reset-password", resetPassword);

export default router;
