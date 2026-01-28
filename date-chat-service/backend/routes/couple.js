const express = require('express');
const router = express.Router();
const Couple = require('../models/Couple');
const CouplePreference = require('../models/CouplePreference');
const User = require('../models/User');

// 커플 코드 생성 함수
function generateCoupleCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * 36));
  }
  return code;
}

// 커플 코드 생성
router.post('/generate-code', async (req, res) => {
  try {
    const userId = req.headers['user-id'];

    // 이미 커플인지 확인
    const user = await User.findById(userId);
    if (user.coupleId) {
      const couple = await Couple.findById(user.coupleId);
      return res.json({ coupleCode: couple.coupleCode });
    }

    // 새 커플 코드 생성
    let coupleCode;
    let isUnique = false;
    while (!isUnique) {
      coupleCode = generateCoupleCode();
      const existing = await Couple.findOne({ coupleCode });
      if (!existing) isUnique = true;
    }

    // 커플 생성 (1명만 있는 상태)
    const couple = new Couple({
      coupleCode,
      users: [userId],
    });
    await couple.save();

    // 사용자에 커플 ID 연결
    user.coupleId = couple._id;
    await user.save();

    res.json({ coupleCode });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 커플 연결
router.post('/link', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { coupleCode } = req.body;

    // 커플 코드로 커플 찾기
    const couple = await Couple.findOne({ coupleCode });
    if (!couple) {
      return res.status(404).json({ error: '유효하지 않은 커플 코드입니다.' });
    }

    // 이미 2명이면 에러
    if (couple.users.length >= 2) {
      return res.status(400).json({ error: '이미 연결된 커플입니다.' });
    }

    // 자기 자신인지 확인
    if (couple.users[0].toString() === userId) {
      return res.status(400).json({ error: '자신의 코드는 입력할 수 없습니다.' });
    }

    // 커플에 추가
    couple.users.push(userId);
    await couple.save();

    // 사용자에 커플 ID 연결
    await User.findByIdAndUpdate(userId, { coupleId: couple._id });

    // 커플 선호도 초기화
    const preference = new CouplePreference({
      coupleId: couple._id,
    });
    await preference.save();

    res.json({
      message: '커플 연결 성공',
      coupleId: couple._id,
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 커플 정보 조회
router.get('/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;

    const couple = await Couple.findById(coupleId).populate('users', 'nickname profileImage');
    if (!couple) {
      return res.status(404).json({ error: '커플을 찾을 수 없습니다.' });
    }

    const preference = await CouplePreference.findOne({ coupleId });

    res.json({
      couple,
      preference,
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 커플 설정 업데이트
router.put('/:coupleId/settings', async (req, res) => {
  try {
    const { coupleId } = req.params;
    const { region, transport } = req.body;

    const couple = await Couple.findByIdAndUpdate(
      coupleId,
      { region, transport },
      { new: true }
    );

    res.json(couple);
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
