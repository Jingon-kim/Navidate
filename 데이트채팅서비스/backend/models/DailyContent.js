const mongoose = require('mongoose');

const hotPlaceSchema = new mongoose.Schema({
  name: String,
  category: String,
  reason: String, // "신규 오픈", "SNS 화제" 등
  location: String,
  source: String,
});

const eventSchema = new mongoose.Schema({
  title: String,
  period: {
    start: Date,
    end: Date,
  },
  location: String,
  type: {
    type: String,
    enum: ['popup', 'exhibition', 'festival', 'sale'],
  },
});

const dailyContentSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  hotPlaces: [hotPlaceSchema],
  events: [eventSchema],
  weather: {
    condition: String,
    temperature: Number,
    recommendation: String,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 오늘 날짜의 콘텐츠 가져오기
dailyContentSchema.statics.getToday = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.findOne({ date: today });
};

module.exports = mongoose.model('DailyContent', dailyContentSchema);
