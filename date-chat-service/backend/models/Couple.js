const mongoose = require('mongoose');

const coupleSchema = new mongoose.Schema({
  coupleCode: {
    type: String,
    required: true,
    unique: true,
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  region: [{
    type: String,
  }],
  transport: {
    type: String,
    enum: ['walk', 'public', 'car'],
    default: 'public',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Couple', coupleSchema);
