const express = require('express');
const router = express.Router();
const SubOrder = require('../models/SubOrder');
const { isAuth, hasRole }= require('../middleware/auth');

// PATCH /api/suborders/:id/approve
router.patch('/approve/:id', isAuth, hasRole('vendor'), async (req, res) => {
  try {
    const subOrderId = req.params.id;

    // Find sub-order by ID and vendor ID (to prevent unauthorized updates)
    const subOrder = await SubOrder.findOne({ _id: subOrderId, vendorId: req.user._id });
    if (!subOrder) {
      return res.status(404).json({ message: 'Sub-order not found or unauthorized' });
    }

    if (subOrder.status !== 'pending') {
      return res.status(400).json({ message: `Cannot approve a sub-order that is already ${subOrder.status}` });
    }

    // Update status
    subOrder.status = 'delivered';
    await subOrder.save();

    res.json({ message: 'Sub-order approved successfully', subOrder });
  } catch (err) {
    res.status(500).json({ message: 'Error approving sub-order', error: err.message });
  }
});

module.exports = router;
