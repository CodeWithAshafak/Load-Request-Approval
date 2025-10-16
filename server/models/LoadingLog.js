import mongoose from "mongoose";

const loadingLogSchema = new mongoose.Schema({
  logId: { type: String, unique: true, required: true },
  assignmentId: { type: String, required: true },
  skuId: { type: String, required: true },
  loadedQty: { type: Number, required: true },
  loadingStart: { type: Date, required: true },
  loadingEnd: { type: Date },
  departureTime: { type: Date },
  remarks: { type: String },
  discrepancyReason: { 
    type: String, 
    enum: ["Stock Shortage", "Damaged Stock", "Truck Capacity Limitation", "Other", null],
    default: null
  },
  discrepancyDetails: { type: String }
}, {
  timestamps: true
});

// Generate log ID before saving
loadingLogSchema.pre('save', function(next) {
  if (!this.logId) {
    this.logId = 'LL' + Date.now().toString().slice(-8);
  }
  next();
});

export default mongoose.model("LoadingLog", loadingLogSchema);
