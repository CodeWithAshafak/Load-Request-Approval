import mongoose from "mongoose";

const skuSchema = new mongoose.Schema({
  skuId: { type: String, unique: true },
  brand: String,
  productName: String,
  packSize: String,
  uom: String
});

export default mongoose.model("SKU", skuSchema);
