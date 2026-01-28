const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  coupleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Couple',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  keywords: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 인덱스 설정
messageSchema.index({ coupleId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
