const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  adCode: { type: String, required: true, unique: true },
  duration: { type: Number, default: 10 }, // seconds
  price: { type: String, default: '101.75' }, // reward per click in LKR
  link: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ad', adSchema);
