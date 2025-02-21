import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"; // Import auth routes
import productRoutes from "./routes/productRoutes.js"; // Product routes
import invoiceRoutes from "./routes/invoiceRoute.js";
import customerRoutes from "./routes/customerRoutes.js";
import morgan from "morgan";
import compression from "compression";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(compression());

// database connection
connectDb();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes); // Product routes
app.use("/api/invoices", invoiceRoutes);
app.use("/api/customers", customerRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
