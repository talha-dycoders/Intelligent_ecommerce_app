const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    name: String,
    image: String
  }],
  shipping: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'paypal', 'apple', 'bank'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    cardLast4: String,
    cardBrand: String
  },
  pricing: {
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  tracking: {
    number: String,
    carrier: String,
    estimatedDelivery: Date,
    shippedDate: Date,
    deliveredDate: Date
  },
  notes: String,
  aiInsights: {
    recommendedProducts: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      reason: String,
      confidence: Number
    }],
    customerSegment: String,
    riskScore: Number,
    upsellOpportunities: [String]
  }
}, {
  timestamps: true
});

// Generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual for order status display
orderSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return statusMap[this.status] || this.status;
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'shipped') {
    this.tracking.shippedDate = new Date();
  } else if (newStatus === 'delivered') {
    this.tracking.deliveredDate = new Date();
  }
  return this.save();
};

// Method to add tracking info
orderSchema.methods.addTracking = function(trackingNumber, carrier) {
  this.tracking.number = trackingNumber;
  this.tracking.carrier = carrier;
  this.tracking.estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);




