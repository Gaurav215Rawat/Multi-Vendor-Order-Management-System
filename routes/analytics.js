const express = require('express');
const { isAuth, hasRole } = require('../middleware/auth');
const SubOrder = require('../models/SubOrder');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const router = express.Router();

const getDateAgo = days => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

router.get('/admin/revenue', isAuth, hasRole('admin'), async (req, res) => {
    const result = await Order.aggregate([
      { $match: { createdAt: { $gte: getDateAgo(30) } } },
      { $lookup: {
          from: 'suborders',
          localField: 'subOrders',
          foreignField: '_id',
          as: 'subOrdersData'
      }},
      { $unwind: '$subOrdersData' },
      { $unwind: '$subOrdersData.items' },
      { $group: {
          _id: '$subOrdersData.vendorId',
          revenue: {
            $sum: {
              $multiply: ['$subOrdersData.items.price', '$subOrdersData.items.quantity']
            }
          }
      }}
    ]);
    res.json(result);
  });
  

router.get('/admin/top-products', isAuth, hasRole('admin'), async (req, res) => {
  const result = await Order.aggregate([
    { $unwind: '$orderItems' },
    { $group: { _id: '$orderItems.productId', totalSold: { $sum: '$orderItems.quantity' } } },
    { $sort: { totalSold: -1 } },
    { $limit: 5 }
  ]);
  res.json(result);
});

router.get('/admin/avg-order', isAuth, hasRole('admin'), async (req, res) => {
  const result = await Order.aggregate([
    { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
  ]);
  res.json(result[0] || { avg: 0 });
});

router.get('/vendor/sales', isAuth, hasRole('vendor'), async (req, res) => {
    try {
        const vendorId = req.user._id;
    
        console.log('Vendor ID:', vendorId); // Log the vendorId to ensure it's correct
    
        // Get the current date
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7); // Set the date to 7 days ago
    
        // Aggregate sales data for the last 7 days for the given vendor
        const dailySales = await SubOrder.aggregate([
          {
            $match: {
              vendorId: new mongoose.Types.ObjectId(vendorId), // Ensure ObjectId is correct
              createdAt: { $gte: sevenDaysAgo, $lt: today }, // Filter by the last 7 days
              status: 'delivered', // Only count completed (delivered) sub-orders
            }
          },
          {
            $unwind: '$items' // Unwind the items array to group by product
          },
          {
            $group: {
              _id: {
                day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by date
              },
              totalSales: { $sum: { $multiply: ["$items.quantity", "$items.price"] } } // Calculate total sales per day
            }
          },
          {
            $sort: { "_id.day": 1 } // Sort by date in ascending order (oldest first)
          }
        ]);
    
        console.log('Daily Sales:', dailySales); // Log the result of the aggregation
    
        // If no sales are found
        if (dailySales.length === 0) {
          return res.json({ message: 'No sales found for the last 7 days' });
        }
    
        // Format the result so each entry includes the date and the sales amount
        const result = dailySales.map(day => ({
          date: day._id.day,
          sales: day.totalSales
        }));
    
        res.json(result);
      } catch (err) {
        console.error('Error fetching daily sales:', err); // Log the error
        res.status(500).json({ message: 'Error fetching daily sales', error: err.message });
      }
    });
  
  
  


// less then 5
router.get('/vendor/low-stock', isAuth, hasRole('vendor'), async (req, res) => {
  const products = await Product.find({ vendorId: req.user._id, stock: { $lt: 5 } });
  res.json(products);
});

module.exports = router;
