import mongoose from "mongoose";

const posmSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: [true, 'POSM code is required'],
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9-]+$/, 'POSM code must contain only uppercase letters, numbers, and hyphens']
  },
  description: { 
    type: String, 
    required: [true, 'POSM description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  category: { 
    type: String, 
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  unitValue: { 
    type: Number, 
    min: [0, 'Unit value cannot be negative'],
    default: 0
  },
  isActive: { type: Boolean, default: true },
  minOrderQty: { type: Number, min: 0, default: 1 },
  maxOrderQty: { type: Number, min: 0, default: 999 },
  weight: { type: Number, min: 0 },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  },
  tags: [{ type: String, trim: true }],
  imageUrl: { type: String },
  supplier: { 
    type: String, 
    trim: true,
    maxlength: [100, 'Supplier name cannot exceed 100 characters']
  },
  notes: { 
    type: String, 
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
posmSchema.index({ code: 1 }, { unique: true });
posmSchema.index({ description: 'text' });
posmSchema.index({ category: 1 });
posmSchema.index({ isActive: 1 });
posmSchema.index({ tags: 1 });

// Virtual for full POSM name
posmSchema.virtual('fullName').get(function() {
  return `${this.description} (${this.code})`;
});

// Ensure virtual fields are serialized
posmSchema.set('toJSON', { virtuals: true });

export default mongoose.model("Posm", posmSchema);
