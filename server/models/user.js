const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  role: { type: String, default: 'user' },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

module.exports = mongoose.model('User', userSchema);
