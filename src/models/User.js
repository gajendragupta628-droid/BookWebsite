const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters']
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  // OAuth fields
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  // Addresses
  addresses: [{
    label: String, // 'Home', 'Office', etc.
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'Nepal' },
    isDefault: { type: Boolean, default: false }
  }],
  // Preferences
  preferences: {
    newsletter: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    recommendations: { type: Boolean, default: true }
  },
  // Account status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date
}, {
  timestamps: true
});

// Indexes are already created via `unique: true` on the fields above.

// Hash password before saving (only for local auth)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    phone: this.phone,
    isVerified: this.isVerified,
    provider: this.provider,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
