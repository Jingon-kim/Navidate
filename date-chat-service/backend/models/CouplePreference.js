const mongoose = require('mongoose');

const couplePreferenceSchema = new mongoose.Schema({
  coupleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Couple',
    required: true,
    unique: true,
  },
  categoryScores: {
    food: {
      type: Map,
      of: Number,
      default: {},
    },
    activity: {
      type: Map,
      of: Number,
      default: {},
    },
    mood: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  regionScores: {
    type: Map,
    of: Number,
    default: {},
  },
  budgetPreference: {
    type: String,
    enum: ['budget', 'medium', 'luxury'],
    default: 'medium',
  },
  recentInterests: [{
    type: String,
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 선호도 점수 업데이트 메서드
couplePreferenceSchema.methods.updateScore = function(category, key, delta) {
  const currentScore = this.categoryScores[category]?.get(key) || 0;
  this.categoryScores[category].set(key, currentScore + delta);
  this.updatedAt = new Date();
};

// 지역 점수 업데이트 메서드
couplePreferenceSchema.methods.updateRegionScore = function(region, delta) {
  const currentScore = this.regionScores.get(region) || 0;
  this.regionScores.set(region, currentScore + delta);
  this.updatedAt = new Date();
};

// 관심사 키워드 추가 메서드
couplePreferenceSchema.methods.addInterest = function(keyword) {
  if (!this.recentInterests.includes(keyword)) {
    this.recentInterests.unshift(keyword);
    if (this.recentInterests.length > 10) {
      this.recentInterests.pop();
    }
  }
  this.updatedAt = new Date();
};

module.exports = mongoose.model('CouplePreference', couplePreferenceSchema);
