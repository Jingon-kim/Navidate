const mongoose = require('mongoose');

const placeReviewSchema = new mongoose.Schema({
  placeId: String,
  name: String,
  category: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  tags: [String], // "맛있어요", "분위기좋아요" 등
  revisit: Boolean,
});

const dateHistorySchema = new mongoose.Schema({
  coupleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Couple',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  places: [placeReviewSchema],
  memo: String,
  photos: [String],
  feedbackApplied: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 인덱스 설정
dateHistorySchema.index({ coupleId: 1, date: -1 });

module.exports = mongoose.model('DateHistory', dateHistorySchema);
