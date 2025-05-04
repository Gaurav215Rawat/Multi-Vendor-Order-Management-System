const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderItems: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number,
        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      }
    ],
    subOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubOrder' }],
    totalAmount: Number,
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('Order', orderSchema);
  