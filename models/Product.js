import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true, required: true },
  price: { type: Number, required: true }, // Selling price
  costPrice: { type: Number }, // Cost price (for profit calculation)
  quantity: { type: Number, default: 0 },
  category: { type: String, enum: ["Electronics", "Grocery", "Clothing"] },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  lowStockThreshold: { type: Number, default: 10 }, // Alert when stock < 10
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Product", productSchema);
