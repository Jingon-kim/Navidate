const axios = require('axios');
const DailyContent = require('../models/DailyContent');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// 매일 자동 업데이트되는 큐레이션 콘텐츠 수집
async function updateDailyContent() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 기존 오늘 데이터가 있으면 업데이트, 없으면 생성
    let dailyContent = await DailyContent.findOne({ date: today });

    if (!dailyContent) {
      dailyContent = new DailyContent({ date: today });
    }

    // 1. 날씨 정보 수집
    const weather = await fetchWeatherInfo();
    dailyContent.weather = weather;

    // 2. 핫플레이스 정보 수집 (실제로는 크롤링/API 연동)
    dailyContent.hotPlaces = await fetchHotPlaces();

    // 3. 이벤트 정보 수집
    dailyContent.events = await fetchEvents();

    dailyContent.updatedAt = new Date();
    await dailyContent.save();

    console.log('Daily content updated successfully');
    return dailyContent;
  } catch (error) {
    console.error('Daily content update failed:', error);
    throw error;
  }
}

// 날씨 정보 수집
async function fetchWeatherInfo() {
  try {
    // 실제로는 날씨 API 연동
    // const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${WEATHER_API_KEY}&units=metric&lang=kr`);

    // 샘플 데이터
    const conditions = ['맑음', '흐림', '비', '눈'];
    const condition = conditions[Math.floor(Math.random() * 2)]; // 맑음 또는 흐림
    const temperature = Math.floor(Math.random() * 15) - 5; // -5 ~ 10도

    let recommendation = '';
    if (temperature < 0) {
      recommendation = '추워요! 따뜻한 실내 데이트 추천';
    } else if (temperature < 10) {
      recommendation = '쌀쌀해요. 따뜻한 카페나 실내 활동 추천';
    } else {
      recommendation = '날씨 좋아요! 야외 데이트도 좋아요';
    }

    if (condition === '비' || condition === '눈') {
      recommendation = '실내 데이트 추천! 영화관, 카페, 전시회 어때요?';
    }

    return {
      condition,
      temperature,
      recommendation,
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return {
      condition: '맑음',
      temperature: 5,
      recommendation: '데이트하기 좋은 날씨예요!',
    };
  }
}

// 핫플레이스 정보 수집 (샘플)
async function fetchHotPlaces() {
  // 실제로는 웹 크롤링 또는 외부 API 연동
  return [
    {
      name: '성수동 새 브런치 카페',
      category: '카페',
      reason: '신규 오픈',
      location: '성수',
      source: 'instagram',
    },
    {
      name: '압구정 루프탑 바',
      category: '술집',
      reason: 'SNS 화제',
      location: '압구정',
      source: 'instagram',
    },
    {
      name: '홍대 팝업스토어',
      category: '쇼핑',
      reason: '한정 기간',
      location: '홍대',
      source: 'blog',
    },
  ];
}

// 이벤트 정보 수집 (샘플)
async function fetchEvents() {
  const today = new Date();

  // 실제로는 웹 크롤링 또는 외부 API 연동
  return [
    {
      title: '성수 팝업스토어',
      period: {
        start: today,
        end: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
      },
      location: '성수동',
      type: 'popup',
    },
    {
      title: '레스토랑 위크',
      period: {
        start: today,
        end: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
      location: '서울 전역',
      type: 'sale',
    },
    {
      title: 'MMCA 특별 전시',
      period: {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
      },
      location: '국립현대미술관',
      type: 'exhibition',
    },
  ];
}

module.exports = {
  updateDailyContent,
  fetchWeatherInfo,
  fetchHotPlaces,
  fetchEvents,
};
