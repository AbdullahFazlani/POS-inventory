import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorResponse, successResponce } from "../utils/ApiRequestResponse.js";
import { StatusCodes } from "http-status-codes";

// Register Controller
export const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;
  try {
    // Validate required fields
    if (!name || !email || !password) {
      return errorResponse(
        res,
        "Please provide all required fields",
        StatusCodes.BAD_REQUEST
      );
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return errorResponse(
        res,
        "Passwords do not match",
        StatusCodes.BAD_REQUEST
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return errorResponse(
        res,
        "Password must be at least 8 characters long",
        StatusCodes.BAD_REQUEST
      );
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return errorResponse(res, "User already exists", StatusCodes.BAD_REQUEST);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user", // Default role if not provided
    });

    await user.save();
    successResponce(res, "User Registered Successfully", StatusCodes.CREATED);
  } catch (error) {
    errorResponse(
      res,
      `Registration failed: ${error.message}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// Login Controller
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validate required fields
    if (!email || !password) {
      return errorResponse(
        res,
        "Please provide email and password",
        StatusCodes.BAD_REQUEST
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(
        res,
        "Invalid email or password",
        StatusCodes.BAD_REQUEST
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(
        res,
        "Invalid email or password",
        StatusCodes.BAD_REQUEST
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    successResponce(res, "Login Successful", StatusCodes.OK, {
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    errorResponse(
      res,
      `Login failed: ${error.message}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// Change password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const { id } = req.user;

  try {
    // Validate required fields
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return errorResponse(
        res,
        "Please provide all required fields",
        StatusCodes.BAD_REQUEST
      );
    }

    // Validate password confirmation
    if (newPassword !== confirmNewPassword) {
      return errorResponse(
        res,
        "New passwords do not match",
        StatusCodes.BAD_REQUEST
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return errorResponse(
        res,
        "Password must be at least 8 characters long",
        StatusCodes.BAD_REQUEST
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, "User not found", StatusCodes.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return errorResponse(
        res,
        "Incorrect current password",
        StatusCodes.BAD_REQUEST
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in DB
    user.password = hashedPassword;
    await user.save();

    successResponce(res, "Password changed successfully", StatusCodes.OK);
  } catch (error) {
    errorResponse(
      res,
      `Password change failed: ${error.message}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return errorResponse(
      res,
      "Refresh token is required",
      StatusCodes.BAD_REQUEST
    );
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, "User not found", StatusCodes.NOT_FOUND);
    }

    // Generate new access token
    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    successResponce(res, "Token refreshed successfully", StatusCodes.OK, {
      token: newToken,
    });
  } catch (error) {
    errorResponse(res, "Invalid refresh token", StatusCodes.UNAUTHORIZED);
  }
};

// Forgot password - send reset email
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(
        res,
        "User with this email does not exist",
        StatusCodes.NOT_FOUND
      );
    }

    // Generate password reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.RESET_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    // In a real application, you would send an email with the reset link
    // For now, we just return the token in the response
    successResponce(res, "Password reset link sent to email", StatusCodes.OK, {
      resetToken,
    });
  } catch (error) {
    errorResponse(
      res,
      `Password reset failed: ${error.message}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
  const { resetToken, newPassword, confirmNewPassword } = req.body;

  try {
    // Validate password confirmation
    if (newPassword !== confirmNewPassword) {
      return errorResponse(
        res,
        "Passwords do not match",
        StatusCodes.BAD_REQUEST
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return errorResponse(
        res,
        "Password must be at least 8 characters long",
        StatusCodes.BAD_REQUEST
      );
    }

    const decoded = jwt.verify(resetToken, process.env.RESET_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(
        res,
        "Invalid or expired token",
        StatusCodes.BAD_REQUEST
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    successResponce(res, "Password reset successful", StatusCodes.OK);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(
        res,
        "Reset token has expired",
        StatusCodes.BAD_REQUEST
      );
    }

    errorResponse(
      res,
      `Password reset failed: ${error.message}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
