const express = require('express');
const router = express.Router();
const axios = require('axios');

const KAKAO_API_KEY = process.env.KAKAO_API_KEY;

// 장소 검색 (카카오 API)
router.get('/search', async (req, res) => {
  try {
    const { query, category, x, y, radius = 5000 } = req.query;

    const response = await axios.get(
      'https://dapi.kakao.com/v2/local/search/keyword.json',
      {
        params: {
          query,
          category_group_code: getCategoryCode(category),
          x,
          y,
          radius,
          size: 15,
        },
        headers: {
          Authorization: `KakaoAK ${KAKAO_API_KEY}`,
        },
      }
    );

    const places = response.data.documents.map((place) => ({
      id: place.id,
      name: place.place_name,
      category: place.category_name,
      address: place.road_address_name || place.address_name,
      phone: place.phone,
      url: place.place_url,
      location: {
        lat: parseFloat(place.y),
        lng: parseFloat(place.x),
      },
      distance: place.distance,
    }));

    res.json(places);
  } catch (error) {
    console.error('Place search error:', error);
    res.status(500).json({ error: '장소 검색에 실패했습니다.' });
  }
});

// 카테고리별 장소 검색
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { x, y, radius = 5000 } = req.query;

    const response = await axios.get(
      'https://dapi.kakao.com/v2/local/search/category.json',
      {
        params: {
          category_group_code: getCategoryCode(category),
          x,
          y,
          radius,
          size: 15,
        },
        headers: {
          Authorization: `KakaoAK ${KAKAO_API_KEY}`,
        },
      }
    );

    const places = response.data.documents.map((place) => ({
      id: place.id,
      name: place.place_name,
      category: place.category_name,
      address: place.road_address_name || place.address_name,
      phone: place.phone,
      url: place.place_url,
      location: {
        lat: parseFloat(place.y),
        lng: parseFloat(place.x),
      },
      distance: place.distance,
    }));

    res.json(places);
  } catch (error) {
    console.error('Category search error:', error);
    res.status(500).json({ error: '장소 검색에 실패했습니다.' });
  }
});

// 카테고리 코드 매핑
function getCategoryCode(category) {
  const categoryMap = {
    food: 'FD6',      // 음식점
    cafe: 'CE7',      // 카페
    movie: 'CT1',     // 문화시설
    shopping: 'MT1',  // 대형마트
    activity: 'AT4',  // 관광명소
    bar: 'FD6',       // 음식점 (술집 포함)
    exhibition: 'CT1', // 문화시설
  };

  return categoryMap[category] || 'FD6';
}

module.exports = router;
