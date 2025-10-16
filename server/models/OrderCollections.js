import mongoose from "mongoose";

// Recommended Orders
export const RecommendedOrder = mongoose.model("RecommendedOrder", new mongoose.Schema({
  lsrId: String,
  outletId: String,
  skuId: String,
  qty: Number
}));

// Pre-Orders
export const PreOrder = mongoose.model("PreOrder", new mongoose.Schema({
  lsrId: String,
  outletId: String,
  skuId: String,
  qty: Number
}));

// POSM Items
export const POSMOrder = mongoose.model("POSMOrder", new mongoose.Schema({
  lsrId: String,
  outletId: String,
  skuId: String,
  qty: Number
}));

// PSR Orders
export const PSROrder = mongoose.model("PSROrder", new mongoose.Schema({
  lsrId: String,
  outletId: String,
  skuId: String,
  qty: Number
}));
