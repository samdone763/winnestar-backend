const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  product: {
    id: { type: String },
    name: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true }
  },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true }
  },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['pending','confirmed','paid','delivered'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
