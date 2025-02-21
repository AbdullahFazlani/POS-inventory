import express from "express";
import {
  changePassword,
  loginUser,
  registerUser,
} from "../controller/authController.js";
import { authMiddleware } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// change password route
router.post("/change-password", authMiddleware, changePassword);

export default router;
