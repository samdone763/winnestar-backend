const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const { orderId, product, customer, notes } = req.body;
    if (!orderId || !product || !customer) return res.status(400).json({ success: false, message: 'Missing required fields.' });
    const order = new Order({ orderId, product, customer, notes, status: 'pending' });
    await order.save();
    if (product.id) {
      const prod = await Product.findById(product.id);
      if (prod && prod.sizes[product.size] >= product.quantity) {
        prod.sizes[product.size] -= product.quantity;
        prod.markModified('sizes');
        await prod.save();
      }
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'paid', 'delivered'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
