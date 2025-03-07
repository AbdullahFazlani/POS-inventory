import Customer from "../models/Customer.js";
import { StatusCodes } from "http-status-codes";
import { errorResponse, successResponce } from "../utils/ApiRequestResponse.js";

// Helper function to recalculate balance
const recalculateBalance = (customer) => {
  return customer.invoiceCreditDebit.reduce(
    (acc, entry) => acc + (entry.debit || 0) - (entry.credit || 0),
    0
  );
};

// Create a new customer
export const createCustomer = async (req, res) => {
  const { name, email, phone, address } = req.body;
  try {
    const newCustomer = new Customer({ name, email, phone, address });
    await newCustomer.save();
    return successResponce(
      res,
      "Customer created successfully",
      StatusCodes.CREATED,
      newCustomer
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

// Handle customer payment
export const recordPayment = async (req, res) => {
  const { customerId, amount } = req.body;

  try {
    const customer = await Customer.findById(customerId);
    if (!customer)
      return errorResponse(res, "Customer not found", StatusCodes.NOT_FOUND);

    customer.invoiceCreditDebit.push({ credit: amount });
    customer.balance = recalculateBalance(customer);
    await customer.save();

    return successResponce(
      res,
      "Payment recorded and balance updated",
      StatusCodes.OK,
      customer
    );
  } catch (error) {
    return errorResponse(
      res,
      "Error recording payment",
      StatusCodes.INTERNAL_SERVER_ERROR,
      error
    );
  }
};

// Get all customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    return successResponce(
      res,
      "Customers retrieved successfully",
      StatusCodes.OK,
      customers
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

// Get a single customer by ID
export const getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findById(id);
    if (!customer)
      return errorResponse(res, "Customer not found", StatusCodes.NOT_FOUND);

    return successResponce(
      res,
      "Customer retrieved successfully",
      StatusCodes.OK,
      customer
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

// Update a customer by ID
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;
  try {
    const customer = await Customer.findByIdAndUpdate(
      id,
      { name, email, phone, address },
      { new: true }
    );
    if (!customer)
      return errorResponse(res, "Customer not found", StatusCodes.NOT_FOUND);

    return successResponce(
      res,
      "Customer updated successfully",
      StatusCodes.OK,
      customer
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

// Delete a customer by ID
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer)
      return errorResponse(res, "Customer not found", StatusCodes.NOT_FOUND);

    return successResponce(
      res,
      "Customer deleted successfully",
      StatusCodes.OK
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
// add all the customers
