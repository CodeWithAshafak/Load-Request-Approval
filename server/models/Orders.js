import mongoose from "mongoose";

const baseOrderSchema = new mongoose.Schema({
  lsrId: String,
  outletId: String,
  skuId: String,
  qty: Number
});

export const RecommendedOrder =
  mongoose.models.RecommendedOrder || mongoose.model("RecommendedOrder", baseOrderSchema);

export const PreOrder =
  mongoose.models.PreOrder || mongoose.model("PreOrder", baseOrderSchema);

export const POSMOrder =
  mongoose.models.POSMOrder || mongoose.model("POSMOrder", baseOrderSchema);

export const PSROrder =
  mongoose.models.PSROrder || mongoose.model("PSROrder", baseOrderSchema);
