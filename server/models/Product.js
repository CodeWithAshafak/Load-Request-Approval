import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  sku: { 
    type: String, 
    required: [true, 'SKU is required'],
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens']
  },
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  defaultUom: { 
    type: String, 
    enum: ['CASE', 'UNIT'], 
    required: [true, 'Default UOM is required']
  },
  category: { 
    type: String, 
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  brand: { 
    type: String, 
    trim: true,
    maxlength: [50, 'Brand cannot exceed 50 characters']
  },
  unitPrice: { 
    type: Number, 
    min: [0, 'Unit price cannot be negative'],
    default: 0
  },
  isActive: { type: Boolean, default: true },
  minOrderQty: { type: Number, min: 0, default: 1 },
  maxOrderQty: { type: Number, min: 0, default: 9999 },
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
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ tags: 1 });

// Virtual for full product name
productSchema.virtual('fullName').get(function() {
  return `${this.name} (${this.sku})`;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

export default mongoose.model("Product", productSchema);
