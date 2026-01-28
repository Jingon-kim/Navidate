const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { extractKeywords } = require('../services/aiRecommend');

// 채팅 기록 조회
router.get('/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;
    const { limit = 50, before } = req.query;

    const query = { coupleId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('senderId', 'nickname profileImage');

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: '메시지 조회에 실패했습니다.' });
  }
});

// 메시지 저장 (키워드 추출 포함)
router.post('/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;
    const { senderId, text } = req.body;

    // 키워드 추출
    const keywords = await extractKeywords(text);

    const message = new Message({
      coupleId,
      senderId,
      text,
      keywords,
    });

    await message.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: '메시지 저장에 실패했습니다.' });
  }
});

// 최근 감지된 키워드 조회
router.get('/:coupleId/keywords', async (req, res) => {
  try {
    const { coupleId } = req.params;

    // 최근 24시간 메시지에서 키워드 추출
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const messages = await Message.find({
      coupleId,
      createdAt: { $gte: oneDayAgo },
      keywords: { $exists: true, $ne: [] },
    });

    // 키워드 집계
    const keywordCount = {};
    messages.forEach((msg) => {
      msg.keywords.forEach((keyword) => {
        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
      });
    });

    // 빈도순 정렬
    const sortedKeywords = Object.entries(keywordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    res.json(sortedKeywords);
  } catch (error) {
    res.status(500).json({ error: '키워드 조회에 실패했습니다.' });
  }
});

module.exports = router;
