const mongoose = require('mongoose');

const subOrderSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number,
      }
    ],
    status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('SubOrder', subOrderSchema);