import express from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controller/productController.js";
import { authMiddleware } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

// Product Routes
router.post("/", authMiddleware, createProduct); // Add product
router.get("/", getProducts); // Get all products
router.put("/:id", authMiddleware, updateProduct); // Update product
router.delete("/:id", authMiddleware, deleteProduct); // Delete product

export default router;
