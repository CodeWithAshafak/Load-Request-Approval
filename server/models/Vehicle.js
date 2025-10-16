import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  truckId: { type: String, unique: true },
  truckNo: String,
  capacity: Number,
  status: { type: String, enum: ["Available", "Assigned"], default: "Available" },
  depotId: String
});

export default mongoose.model("Vehicle", vehicleSchema);
