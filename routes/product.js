const express = require('express');
const Product = require('../models/Product');
const { isAuth, hasRole } = require('../middleware/auth');
const router = express.Router();

router.post('/', isAuth, hasRole('vendor'), async (req, res) => {
  const product = await Product.create({ ...req.body, vendorId: req.user._id });
  res.json(product);
});

router.put('/:id', isAuth, hasRole('vendor'), async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

router.delete('/:id', isAuth, hasRole('vendor'), async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});


router.get('/', async (req, res) => {
    try {
      const products = await Product.find().populate('vendorId', 'name email');
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });


module.exports = router;
