const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: false
},
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Ad', adSchema);