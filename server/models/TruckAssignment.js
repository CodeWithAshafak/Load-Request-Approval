import mongoose from "mongoose";

const truckAssignmentSchema = new mongoose.Schema({
  assignmentId: { type: String, unique: true, required: true },
  requestId: { type: String, required: true },
  truckId: { type: String, required: true },
  driverId: { type: String, required: true },
  helperId: { type: String, required: true },
  capacity: { type: Number, required: true },
  utilizationPct: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ["Assigned", "Loading", "Shipped", "Completed"], 
    default: "Assigned" 
  },
  assignedAt: { type: Date, default: Date.now },
  loadingStartTime: { type: Date },
  loadingEndTime: { type: Date },
  departureTime: { type: Date }
}, {
  timestamps: true
});

// Generate assignment ID before saving
truckAssignmentSchema.pre('save', function(next) {
  if (!this.assignmentId) {
    this.assignmentId = 'TA' + Date.now().toString().slice(-8);
  }
  next();
});

export default mongoose.model("TruckAssignment", truckAssignmentSchema);
