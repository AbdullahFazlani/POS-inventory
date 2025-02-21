import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true },
    phone: { type: String },
    invoiceCreditDebit: [
      {
        credit: { type: Number, default: 0 },
        debit: { type: Number, default: 0 },
        invoiceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Invoice",
          required: false,
        },
      },
    ],
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Method to calculate balance based on all credits and debits
customerSchema.methods.calculateBalance = function () {
  let totalCredit = 0;
  let totalDebit = 0;

  this.invoiceCreditDebit.forEach((transaction) => {
    totalCredit += transaction.credit;
    totalDebit += transaction.debit;
  });

  this.balance = totalDebit - totalCredit;
  return this.balance;
};

export default mongoose.model("Customer", customerSchema);
