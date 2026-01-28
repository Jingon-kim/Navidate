const Message = require('../models/Message');
const CouplePreference = require('../models/CouplePreference');
const { extractKeywords, updatePreferenceFromKeywords } = require('./aiRecommend');

// 커플별 연결된 소켓 관리
const coupleRooms = new Map();

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);

    // 커플 룸 참가
    socket.on('join-couple', ({ coupleId, userId }) => {
      socket.join(`couple:${coupleId}`);
      socket.coupleId = coupleId;
      socket.userId = userId;

      // 상대방에게 온라인 알림
      socket.to(`couple:${coupleId}`).emit('partner-online', { userId });

      console.log(`User ${userId} joined couple room ${coupleId}`);
    });

    // 채팅 메시지
    socket.on('chat-message', async ({ coupleId, text }) => {
      try {
        // 키워드 추출
        const keywords = await extractKeywords(text);

        // 메시지 저장
        const message = new Message({
          coupleId,
          senderId: socket.userId,
          text,
          keywords,
        });
        await message.save();

        // 키워드가 있으면 선호도 업데이트
        if (keywords.length > 0) {
          await updatePreferenceFromKeywords(coupleId, keywords);
        }

        // 커플 룸에 메시지 브로드캐스트
        io.to(`couple:${coupleId}`).emit('new-message', {
          id: message._id,
          senderId: socket.userId,
          text,
          keywords,
          createdAt: message.createdAt,
        });

        // 키워드 감지 알림
        if (keywords.length > 0) {
          io.to(`couple:${coupleId}`).emit('keywords-detected', { keywords });
        }
      } catch (error) {
        console.error('Chat message error:', error);
        socket.emit('error', { message: '메시지 전송에 실패했습니다.' });
      }
    });

    // 커플 싱크 - 스와이프 선택
    socket.on('sync-swipe', ({ coupleId, placeId, liked }) => {
      // 상대방에게 선택 알림
      socket.to(`couple:${coupleId}`).emit('partner-swipe', {
        userId: socket.userId,
        placeId,
        liked,
      });
    });

    // 커플 싱크 - 매칭 확인
    socket.on('sync-match', ({ coupleId, placeId }) => {
      io.to(`couple:${coupleId}`).emit('place-matched', { placeId });
    });

    // 타이핑 표시
    socket.on('typing-start', ({ coupleId }) => {
      socket.to(`couple:${coupleId}`).emit('partner-typing', { userId: socket.userId });
    });

    socket.on('typing-end', ({ coupleId }) => {
      socket.to(`couple:${coupleId}`).emit('partner-typing-end', { userId: socket.userId });
    });

    // 연결 해제
    socket.on('disconnect', () => {
      if (socket.coupleId) {
        socket.to(`couple:${socket.coupleId}`).emit('partner-offline', {
          userId: socket.userId,
        });
      }
      console.log('Socket disconnected:', socket.id);
    });
  });
}

module.exports = { setupSocketHandlers };
