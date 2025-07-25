const mongoose = require('mongoose');

const fcmTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for anonymous users
  },
  deviceType: {
    type: String,
    enum: ['mobile', 'web'],
    required: true,
  },
  platform: {
    type: String,
    enum: ['ios', 'android', 'web'],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUsed: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
fcmTokenSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
fcmTokenSchema.index({ userId: 1, deviceType: 1 });
fcmTokenSchema.index({ token: 1 }, { unique: true });
fcmTokenSchema.index({ isActive: 1 });

module.exports = mongoose.model('FCMToken', fcmTokenSchema); 