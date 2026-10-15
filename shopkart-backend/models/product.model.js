const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: [0.01, 'Price must be greater than 0']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative']
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('Product', productSchema);
