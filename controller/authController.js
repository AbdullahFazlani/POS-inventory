import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorResponse, successResponce } from "../utils/ApiRequestResponse.js";
import { StatusCodes } from "http-status-codes";

// Register Controller
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return errorResponse(res, "User already exist", StatusCodes.BAD_REQUEST);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();
    successResponce(res, "User Registered Successfully", StatusCodes.CREATED);
  } catch (error) {
    errorResponse(res, "Server error", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Login Controller
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
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
      // return res.status(400).json({ message: "Invalid email or password" });
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

    successResponce(res, "Login Successfully", StatusCodes.OK, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    errorResponse(res, "Server error", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

//change password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { id } = req.user;

  try {
    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, "User not found", StatusCodes.NOT_FOUND);
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      // return res.status(400).json({ message: "Incorrect old password" });
      return errorResponse(
        res,
        "Incorrect old password",
        StatusCodes.BAD_REQUEST
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in DB
    user.password = hashedPassword;
    await user.save();

    // res.status(200).json({ message: "Password changed successfully" });
    successResponce(res, "Password changed successfully", StatusCodes.OK);
  } catch (error) {
    errorResponse(res, "Server error", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
