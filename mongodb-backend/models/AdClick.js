const mongoose = require('mongoose');

const adClickSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad', required: true },
  clickedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AdClick', adClickSchema);
