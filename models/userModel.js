const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add a name'], unique: true },
  email: { type: String, required: [true, 'Please add an email'], unique: true },
  password: { type: String, required: [true, 'Please add a password'] },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);