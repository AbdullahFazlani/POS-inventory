import express from "express";
import { createInvoice, getInvoices } from "../controller/invoiceController.js";
import { authMiddleware } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createInvoice); // Generate an invoice
router.get("/", authMiddleware, getInvoices); // Get all invoices

export default router;
