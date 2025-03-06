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
