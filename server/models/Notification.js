import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  notificationId: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Unread", "Read"], 
    default: "Unread" 
  },
  type: { 
    type: String, 
    enum: ["Approval", "Discrepancy", "System"], 
    default: "System" 
  },
  relatedRequestId: { type: String },
  createdOn: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Generate notification ID before saving
notificationSchema.pre('save', function(next) {
  if (!this.notificationId) {
    this.notificationId = 'NT' + Date.now().toString().slice(-8);
  }
  next();
});

export default mongoose.model("Notification", notificationSchema);
