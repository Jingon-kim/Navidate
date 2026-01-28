const express = require('express');
const router = express.Router();
const CouplePreference = require('../models/CouplePreference');
const DailyContent = require('../models/DailyContent');
const { analyzeAndRecommend } = require('../services/aiRecommend');

// AI 맞춤 추천
router.get('/ai/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;

    // 커플 선호도 가져오기
    const preference = await CouplePreference.findOne({ coupleId });

    // 오늘의 데일리 콘텐츠 가져오기
    const dailyContent = await DailyContent.getToday();

    // AI 추천 생성
    const recommendation = await analyzeAndRecommend(preference, dailyContent);

    res.json(recommendation);
  } catch (error) {
    console.error('AI recommend error:', error);
    res.status(500).json({ error: '추천 생성에 실패했습니다.' });
  }
});

// 오늘의 데일리 콘텐츠
router.get('/daily', async (req, res) => {
  try {
    const dailyContent = await DailyContent.getToday();

    if (!dailyContent) {
      return res.json({
        hotPlaces: [],
        events: [],
        weather: null,
      });
    }

    res.json(dailyContent);
  } catch (error) {
    res.status(500).json({ error: '데일리 콘텐츠 조회에 실패했습니다.' });
  }
});

// 카테고리 기반 추천
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const coupleId = req.headers['couple-id'];

    const preference = await CouplePreference.findOne({ coupleId });

    // 선호도 기반 필터링 로직
    // TODO: 카카오 API와 연동하여 실제 장소 추천

    res.json({
      category,
      places: [],
      reason: '커플 취향 분석 기반 추천',
    });
  } catch (error) {
    res.status(500).json({ error: '추천 생성에 실패했습니다.' });
  }
});

module.exports = router;
