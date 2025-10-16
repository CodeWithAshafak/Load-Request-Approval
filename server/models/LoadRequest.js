import mongoose from "mongoose";

const productLineSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sku: { 
    type: String, 
    required: [true, 'SKU is required'],
    trim: true,
    uppercase: true
  },
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true
  },
  uom: { 
    type: String, 
    enum: ['CASE', 'UNIT'], 
    required: [true, 'UOM is required']
  },
  qty: { 
    type: Number, 
    required: [true, 'Quantity is required'], 
    min: [0, 'Quantity cannot be negative'],
    max: [9999, 'Quantity cannot exceed 9999']
  },
  unitPrice: { type: Number, min: 0 },
  totalValue: { type: Number, min: 0 }
});

const posmLineSchema = new mongoose.Schema({
  id: { type: String, required: true },
  code: { 
    type: String, 
    required: [true, 'POSM code is required'],
    trim: true,
    uppercase: true
  },
  description: { 
    type: String, 
    required: [true, 'POSM description is required'],
    trim: true
  },
  qty: { 
    type: Number, 
    required: [true, 'Quantity is required'], 
    min: [0, 'Quantity cannot be negative'],
    max: [999, 'Quantity cannot exceed 999']
  },
  unitValue: { type: Number, min: 0 },
  totalValue: { type: Number, min: 0 }
});

const loadRequestSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  requestNumber: { 
    type: String, 
    unique: true
  },
  lsrId: { 
    type: String, 
    required: [true, 'LSR ID is required'],
    ref: 'User'
  },
  lsrName: { type: String, trim: true },
  route: { 
    type: String, 
    trim: true,
    maxlength: [100, 'Route cannot exceed 100 characters']
  },
  notes: { 
    type: String, 
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  status: { 
    type: String, 
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'], 
    default: 'DRAFT',
    required: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  createdAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  decidedAt: { type: Date },
  approverId: { 
    type: String,
    ref: 'User'
  },
  approverName: { type: String, trim: true },
  decisionReason: { 
    type: String, 
    trim: true,
    maxlength: [500, 'Decision reason cannot exceed 500 characters']
  },
  commercialProducts: [productLineSchema],
  posmItems: [posmLineSchema],
  totalValue: { type: Number, min: 0, default: 0 },
  isUrgent: { type: Boolean, default: false },
  deliveryDate: { type: Date },
  specialInstructions: { 
    type: String, 
    trim: true,
    maxlength: [1000, 'Special instructions cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
loadRequestSchema.index({ lsrId: 1 });
loadRequestSchema.index({ status: 1 });
loadRequestSchema.index({ requestNumber: 1 });
loadRequestSchema.index({ createdAt: -1 });
loadRequestSchema.index({ submittedAt: -1 });
loadRequestSchema.index({ approverId: 1 });
loadRequestSchema.index({ 'commercialProducts.sku': 1 });
loadRequestSchema.index({ 'posmItems.code': 1 });

// Generate request number and id before validation
loadRequestSchema.pre('validate', function(next) {
  // Always generate requestNumber if not provided
  if (!this.requestNumber) {
    // Use ObjectId for guaranteed uniqueness
    const objectId = new mongoose.Types.ObjectId();
    this.requestNumber = `LR${objectId.toString().slice(-8).toUpperCase()}`;
  }
  
  // Always generate id if not provided
  if (!this.id) {
    this.id = new mongoose.Types.ObjectId().toString();
  }
  
  next();
});

// Generate request number and id before saving
loadRequestSchema.pre('save', function(next) {
  // Ensure requestNumber is set (should already be set by pre-validate)
  if (!this.requestNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.requestNumber = `LR${timestamp}${random}`;
  }
  
  // Ensure id is set (should already be set by pre-validate)
  if (!this.id) {
    this.id = new mongoose.Types.ObjectId().toString();
  }
  
  // Generate IDs for commercial products if not present
  this.commercialProducts.forEach(product => {
    if (!product.id) {
      product.id = new mongoose.Types.ObjectId().toString();
    }
    // Calculate total value
    if (product.unitPrice && product.qty) {
      product.totalValue = product.unitPrice * product.qty;
    }
  });
  
  // Generate IDs for POSM items if not present
  this.posmItems.forEach(item => {
    if (!item.id) {
      item.id = new mongoose.Types.ObjectId().toString();
    }
    // Calculate total value
    if (item.unitValue && item.qty) {
      item.totalValue = item.unitValue * item.qty;
    }
  });
  
  // Calculate total value
  const commercialTotal = this.commercialProducts.reduce((sum, product) => sum + (product.totalValue || 0), 0);
  const posmTotal = this.posmItems.reduce((sum, item) => sum + (item.totalValue || 0), 0);
  this.totalValue = commercialTotal + posmTotal;
  
  next();
});

// Virtual for total items count
loadRequestSchema.virtual('totalItems').get(function() {
  return this.commercialProducts.length + this.posmItems.length;
});

// Virtual for total quantity
loadRequestSchema.virtual('totalQuantity').get(function() {
  const commercialQty = this.commercialProducts.reduce((sum, product) => sum + product.qty, 0);
  const posmQty = this.posmItems.reduce((sum, item) => sum + item.qty, 0);
  return commercialQty + posmQty;
});

// Ensure virtual fields are serialized
loadRequestSchema.set('toJSON', { virtuals: true });

export default mongoose.model("LoadRequest", loadRequestSchema);