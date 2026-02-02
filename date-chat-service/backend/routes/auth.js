const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 회원가입
router.post('/signup', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    // 이메일 중복 체크
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: '이미 사용 중인 이메일입니다.' });
    }

    // TODO: 비밀번호 해싱 추가
    const user = new User({
      email,
      password,
      nickname,
    });

    await user.save();

    res.status(201).json({
      message: '회원가입 성공',
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.', detail: error.message });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }

    // TODO: 비밀번호 비교 로직 추가
    if (user.password !== password) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }

    // TODO: JWT 토큰 생성
    res.json({
      message: '로그인 성공',
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        coupleId: user.coupleId,
      },
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 정보 조회
router.get('/me', async (req, res) => {
  try {
    // TODO: 토큰 검증 미들웨어 추가
    const userId = req.headers['user-id'];

    const user = await User.findById(userId).populate('coupleId');
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    res.json({
      id: user._id,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage,
      coupleId: user.coupleId,
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
