import { StatusCodes } from "http-status-codes";
import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";
import Product from "../models/Product.js";
import { v4 as uuidv4 } from "uuid"; // For generating unique invoice numbers
import { errorResponse, successResponce } from "../utils/ApiRequestResponse.js";

const recalculateBalance = (customer) => {
  console.log("recalculateBalance", customer);
  return customer.invoiceCreditDebit.reduce(
    (acc, entry) => acc + (entry.debit || 0) - (entry.credit || 0),
    0
  );
};

// Generate an invoice
export const createInvoice = async (req, res) => {
  const { customerId, products, tax, billStatus } = req.body;

  try {
    let totalAmount = 0;
    const invoiceProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product)
        // return res
        //   .status(404)
        //   .json({ message: `Product not found: ${item.product}` });
        errorResponse(
          res,
          `Product not found : ${item.product}`,
          StatusCodes.NOT_FOUND
        );

      if (billStatus !== "return" && product.quantity < item.quantity) {
        // return res
        //   .status(400)
        //   .json({ message: `Insufficient stock for ${product.name}` });
        errorResponse(
          res,
          `Insufficient stock for ${product.name}`,
          StatusCodes.NOT_FOUND
        );
      }

      billStatus === "return"
        ? (product.quantity += item.quantity)
        : (product.quantity -= item.quantity);

      const productData = await product.save();
      if (!productData) {
        // return res.status(404).json({ message: "Product is not saved" });
        errorResponse(res, `Product is not saved`, StatusCodes.NOT_FOUND);
      }

      const calcPrice = item.quantity * product.price;
      totalAmount += calcPrice; // Correctly add each product's price to total
      //   console.log(product);

      invoiceProducts.push({
        name: product.name,
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const grandTotal = totalAmount + (tax || 0);

    const setPaymentStatus = (status) => {
      switch (status) {
        case "paid":
          return "paid";
        case "partial":
          return "partial";
        case "return":
          return "return";
        default:
          return "unpaid";
      }
    };

    const newInvoice = new Invoice({
      invoiceNumber: uuidv4(),
      customer: customerId,
      products: invoiceProducts,
      totalAmount,
      tax: tax || 0,
      grandTotal,
      paymentStatus: setPaymentStatus(billStatus),
    });
    // console.log(newInvoice);
    const invoiceData = await newInvoice.save();
    if (!invoiceData) {
      //   return res.status(404).json({ message: "Invoice is not saved" });
      errorResponse(res, `Invoice is not saved`, StatusCodes.NOT_FOUND);
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      //   return res.status(404).json({ message: "Customer not found" });
      errorResponse(res, `Customer not found`, StatusCodes.NOT_FOUND);
    }
    const getDebitBill = (billStatus) => {
      switch (billStatus) {
        case "paid":
          return 0;
        case "return":
          return 0;
        case "unpaid":
          return grandTotal;
      }
    };
    // Update customer's debit and balance
    customer.invoiceCreditDebit.push({
      debit: getDebitBill(billStatus),
      credit: billStatus === "return" ? grandTotal : 0,
      invoiceId: invoiceData._id,
    });

    customer.balance = recalculateBalance(customer);
    const customerData = await customer.save();
    if (!customerData) {
      //   return res.status(404).json({ message: "customerData is not saved" });
      errorResponse(res, `customer Data is not saved`, StatusCodes.NOT_FOUND);
    }

    // res
    //   .status(201)
    //   .json({ message: "Invoice generated successfully", invoice: newInvoice });
    successResponce(
      res,
      "Invoice gennerated successfully",
      StatusCodes.CREATED
    );
  } catch (error) {
    // res.status(500).json({ message: "Server error", error });
    errorResponse(res, "Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Get all invoices with optional filtering (e.g., date range)
export const getInvoices = async (req, res) => {
  const { startDate, endDate } = req.query;
  let filter = {};

  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lt: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
    };
  }

  try {
    const invoices = await Invoice.find(filter).populate("products.product");

    // Calculate total sales
    let totalSales = 0;
    invoices.forEach((invoice) => {
      totalSales += invoice.totalAmount; // Assuming totalAmount field exists
    });

    // res.status(200).json({ invoices, totalSales });
    successResponce(res, "Invoices retrieved successfully", StatusCodes.OK, {
      invoices,
      totalSales,
    });
  } catch (error) {
    // res.status(500).json({ message: "Server error", error });
    errorResponse(res, "Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
