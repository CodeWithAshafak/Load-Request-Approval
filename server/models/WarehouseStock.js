import mongoose from "mongoose";

const warehouseStockSchema = new mongoose.Schema({
  skuId: { type: String, required: true },
  warehouseId: { type: String, required: true },
  availableQty: { type: Number, required: true, default: 0 },
  reservedQty: { type: Number, required: true, default: 0 },
  updatedOn: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Compound index for SKU and Warehouse
warehouseStockSchema.index({ skuId: 1, warehouseId: 1 }, { unique: true });

export default mongoose.model("WarehouseStock", warehouseStockSchema);
