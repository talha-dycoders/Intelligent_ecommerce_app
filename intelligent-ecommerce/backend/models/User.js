const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'seller'],
    default: 'customer'
  },
  profile: {
    avatar: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  preferences: {
    categories: [String],
    priceRange: {
      min: Number,
      max: Number
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  aiProfile: {
    purchaseHistory: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number,
      purchaseDate: Date,
      rating: Number
    }],
    browsingHistory: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      timestamp: Date,
      duration: Number
    }],
    preferences: {
      categories: [String],
      priceRange: {
        min: Number,
        max: Number
      },
      brands: [String]
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update AI preferences
userSchema.methods.updateAIPreferences = function(productId, interaction) {
  const { type, rating, duration } = interaction;
  
  if (type === 'purchase') {
    this.aiProfile.purchaseHistory.push({
      product: productId,
      quantity: interaction.quantity || 1,
      purchaseDate: new Date(),
      rating: rating || null
    });
  } else if (type === 'browse') {
    this.aiProfile.browsingHistory.push({
      product: productId,
      timestamp: new Date(),
      duration: duration || 0
    });
  }
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
