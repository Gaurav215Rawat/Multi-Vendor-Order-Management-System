const express = require('express');
const mongoose = require('mongoose');
const { isAuth, hasRole } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const router = express.Router();


/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Order successfully created
 *       500:
 *         description: Server error or insufficient stock
 */
router.post('/', isAuth, hasRole('customer'), async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const items = req.body.items;
    const productMap = new Map();
    const vendorMap = new Map();
    let total = 0;

    for (let { productId, quantity } of items) {
      const product = await Product.findById(productId).session(session);
      if (!product || product.stock < quantity) throw new Error(`Insufficient Stock for productID-${productId}`);
      product.stock -= quantity;
      await product.save();
      total += product.price * quantity;
      productMap.set(productId, { ...product._doc, quantity });
      if (!vendorMap.has(product.vendorId)) vendorMap.set(product.vendorId.toString(), []);
      vendorMap.get(product.vendorId.toString()).push({ productId, quantity, price: product.price });
    }

    const subOrders = [];
    for (const [vendorId, items] of vendorMap.entries()) {
      const subOrder = await SubOrder.create([{ vendorId, items }], { session });
      subOrders.push(subOrder[0]._id);
    }

    const order = await Order.create([{ userId: req.user._id, orderItems: items, subOrders, totalAmount: total }], { session });
    await session.commitTransaction();
    session.endSession();
    res.json(order[0]);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
});



/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders (role-based)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *       500:
 *         description: Error fetching orders
 */
// Get orders based on role
router.get('/', isAuth, async (req, res) => {
    try {
      let orders;
  
      if (req.user.role === 'admin') {
        // Admin sees all orders
        orders = await Order.find().populate('userId', 'email').populate('subOrders');
      } else if (req.user.role === 'vendor') {
        // Vendor sees sub-orders assigned to them
        const subOrders = await SubOrder.find({ vendorId: req.user._id });
        const orderIds = subOrders.map((sub) => sub._id);
        orders = await Order.find({ subOrders: { $in: orderIds } }).populate('userId', 'email').populate('subOrders');
      } else {
        // Customer sees their own orders
        orders = await Order.find({ userId: req.user._id }).populate('subOrders');
      }
  
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching orders', error: err.message });
    }
  });





  /**
 * @swagger
 * /orders/{userId}:
 *   get:
 *     summary: Get orders by user ID (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to filter orders
 *     responses:
 *       200:
 *         description: Orders of a specific user
 *       500:
 *         description: Error fetching user orders
 */
  // Get orders based on role or specific userId (admin only)
router.get('/:userId', isAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      let orders;
  
      if (req.user.role === 'admin') {
        if (userId) {
          orders = await Order.find({ userId })
            .populate('userId', 'email')
            .populate('subOrders');
        } else {
          orders = await Order.find()
            .populate('userId', 'email')
            .populate('subOrders');
        }
      } else if (req.user.role === 'vendor') {
        // Vendor sees sub-orders assigned to them
        const subOrders = await SubOrder.find({ vendorId: req.user._id });
        const subOrderIds = subOrders.map((sub) => sub._id);
        orders = await Order.find({ subOrders: { $in: subOrderIds } })
          .populate('userId', 'email')
          .populate('subOrders');
      } else {
        // Customer sees their own orders
        orders = await Order.find({ userId: req.user._id }).populate('subOrders');
      }
  
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching orders', error: err.message });
    }
  });
  
module.exports = router;
