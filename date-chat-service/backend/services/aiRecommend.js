const axios = require('axios');
const CouplePreference = require('../models/CouplePreference');

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// 데이트 관련 키워드 목록
const DATE_KEYWORDS = {
  food: ['밥', '먹', '음식', '맛집', '점심', '저녁', '아침', '배고파', '뭐먹', '식사'],
  cuisine: ['한식', '양식', '일식', '중식', '분식', '파스타', '피자', '초밥', '라멘', '치킨', '삼겹살', '스테이크', '브런치'],
  cafe: ['카페', '커피', '디저트', '케이크', '베이커리', '빵', '차', '음료'],
  activity: ['영화', '전시', '공연', '뮤지컬', '콘서트', '쇼핑', '산책', '드라이브'],
  mood: ['로맨틱', '조용', '시끄러운', '분위기', '예쁜', '힙한', '아늑'],
  region: ['강남', '홍대', '성수', '이태원', '신촌', '건대', '압구정', '청담', '연남', '망원', '한남'],
};

// 메시지에서 키워드 추출
async function extractKeywords(text) {
  const keywords = [];

  // 간단한 키워드 매칭
  Object.entries(DATE_KEYWORDS).forEach(([category, words]) => {
    words.forEach((word) => {
      if (text.includes(word)) {
        keywords.push(word);
      }
    });
  });

  return [...new Set(keywords)]; // 중복 제거
}

// 키워드 기반 선호도 업데이트
async function updatePreferenceFromKeywords(coupleId, keywords) {
  try {
    const preference = await CouplePreference.findOne({ coupleId });
    if (!preference) return;

    keywords.forEach((keyword) => {
      // 음식 카테고리
      if (DATE_KEYWORDS.cuisine.includes(keyword)) {
        const cuisineType = mapCuisineType(keyword);
        preference.updateScore('food', cuisineType, 1);
      }

      // 지역
      if (DATE_KEYWORDS.region.includes(keyword)) {
        preference.updateRegionScore(keyword, 1);
      }

      // 관심사 추가
      preference.addInterest(keyword);
    });

    await preference.save();
  } catch (error) {
    console.error('Preference update error:', error);
  }
}

// 요리 타입 매핑
function mapCuisineType(keyword) {
  const mapping = {
    '한식': 'korean', '삼겹살': 'korean',
    '양식': 'western', '파스타': 'western', '피자': 'western', '스테이크': 'western', '브런치': 'western',
    '일식': 'japanese', '초밥': 'japanese', '라멘': 'japanese',
    '중식': 'chinese',
    '분식': 'snack',
    '치킨': 'chicken',
  };
  return mapping[keyword] || 'other';
}

// AI 기반 데이트 코스 추천
async function analyzeAndRecommend(preference, dailyContent) {
  // 기본 추천 구조
  const recommendation = {
    reason: '',
    course: [],
    dailyTips: [],
  };

  if (!preference) {
    recommendation.reason = '아직 취향 데이터가 부족해요. 더 많은 대화를 나눠보세요!';
    return recommendation;
  }

  // 선호도 분석
  const topFoods = getTopScores(preference.categoryScores.food);
  const topRegions = getTopScores(preference.regionScores);
  const recentInterests = preference.recentInterests.slice(0, 3);

  // 추천 이유 생성
  const reasons = [];
  if (recentInterests.length > 0) {
    reasons.push(`최근 대화에서 "${recentInterests.join('", "')}" 키워드가 감지되었어요`);
  }
  if (topFoods.length > 0) {
    reasons.push(`${topFoods[0]}을(를) 자주 선택하셨어요`);
  }
  if (topRegions.length > 0) {
    reasons.push(`${topRegions[0]} 지역을 선호하시네요`);
  }

  recommendation.reason = reasons.join(', ') + '.';

  // 데일리 콘텐츠 기반 팁
  if (dailyContent) {
    if (dailyContent.weather) {
      recommendation.dailyTips.push({
        icon: '🌤️',
        text: `${dailyContent.weather.condition} ${dailyContent.weather.temperature}°C - ${dailyContent.weather.recommendation}`,
      });
    }

    dailyContent.events.slice(0, 2).forEach((event) => {
      if (new Date(event.period.end) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)) {
        recommendation.dailyTips.push({
          icon: '🎨',
          text: `${event.title} 곧 종료!`,
        });
      }
    });
  }

  // 샘플 코스 (실제로는 카카오 API와 연동)
  recommendation.course = [
    {
      time: '12:00',
      icon: '🍝',
      name: '추천 맛집',
      location: topRegions[0] || '성수',
      description: `${topFoods[0] || '맛집'} · 분위기 좋음`,
      travelTime: '도보 5분',
    },
    {
      time: '14:00',
      icon: '☕',
      name: '추천 카페',
      location: topRegions[0] || '성수',
      description: '디저트 맛집 · 사진 찍기 좋음',
      travelTime: '도보 8분',
    },
    {
      time: '16:00',
      icon: '🎨',
      name: '추천 활동',
      location: topRegions[0] || '성수',
      description: '전시/체험 · 커플 추천',
    },
  ];

  return recommendation;
}

// 상위 점수 항목 추출
function getTopScores(scoreMap, limit = 3) {
  if (!scoreMap) return [];

  const entries = scoreMap instanceof Map
    ? Array.from(scoreMap.entries())
    : Object.entries(scoreMap);

  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

module.exports = {
  extractKeywords,
  updatePreferenceFromKeywords,
  analyzeAndRecommend,
};
