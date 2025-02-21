import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      name: { type: String },
    },
  ],
  totalAmount: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "return"],
    default: "unpaid",
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Invoice", invoiceSchema);
