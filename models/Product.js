const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, default: 'Other' },
  buyingPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  sizes: {
    XS: { type: Number, default: 0 },
    S:  { type: Number, default: 0 },
    M:  { type: Number, default: 0 },
    L:  { type: Number, default: 0 },
    XL: { type: Number, default: 0 },
    XXL:{ type: Number, default: 0 }
  },
  imageUrl: { type: String, default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
