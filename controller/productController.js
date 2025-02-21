import Product from "../models/Product.js";
import { StatusCodes } from "http-status-codes";
import { errorResponse, successResponce } from "../utils/ApiRequestResponse.js";

// Create a new product
export const createProduct = async (req, res) => {
  const {
    name,
    sku,
    price,
    costPrice,
    quantity,
    category,
    supplier,
    lowStockThreshold,
  } = req.body;

  try {
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return errorResponse(
        res,
        "Product with this SKU already exists",
        StatusCodes.BAD_REQUEST
      );
    }

    const newProduct = new Product({
      name,
      sku,
      price,
      costPrice,
      quantity,
      category,
      supplier,
      lowStockThreshold,
    });

    await newProduct.save();
    return successResponce(
      res,
      "Product created successfully",
      StatusCodes.CREATED,
      newProduct
    );
  } catch (error) {
    return errorResponse(
      res,
      "Server error",
      StatusCodes.INTERNAL_SERVER_ERROR,
      error
    );
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return successResponce(
      res,
      "Products retrieved successfully",
      StatusCodes.OK,
      products
    );
  } catch (error) {
    return errorResponse(
      res,
      "Server error",
      StatusCodes.INTERNAL_SERVER_ERROR,
      error
    );
  }
};

// Update a product by ID
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    sku,
    price,
    costPrice,
    quantity,
    category,
    supplier,
    lowStockThreshold,
  } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(res, "Product not found", StatusCodes.NOT_FOUND);
    }

    product.name = name || product.name;
    product.sku = sku || product.sku;
    product.price = price || product.price;
    product.costPrice = costPrice || product.costPrice;
    product.quantity = quantity || product.quantity;
    product.category = category || product.category;
    product.supplier = supplier || product.supplier;
    product.lowStockThreshold = lowStockThreshold || product.lowStockThreshold;

    await product.save();
    return successResponce(
      res,
      "Product updated successfully",
      StatusCodes.OK,
      product
    );
  } catch (error) {
    return errorResponse(
      res,
      "Server error",
      StatusCodes.INTERNAL_SERVER_ERROR,
      error
    );
  }
};

// Delete a product by ID
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(res, "Product not found", StatusCodes.NOT_FOUND);
    }

    await Product.findByIdAndDelete(id);
    return successResponce(res, "Product deleted successfully", StatusCodes.OK);
  } catch (error) {
    return errorResponse(
      res,
      "Server error",
      StatusCodes.INTERNAL_SERVER_ERROR,
      error
    );
  }
};
