import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary)]">NaviDate</h1>
        <Link to="/login" className="text-[var(--text-light)]">로그인</Link>
      </header>

      {/* Daily Curation Banner */}
      <section className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📅</span>
          <span className="font-semibold">오늘의 데이트 정보</span>
          <span className="text-xs text-[var(--text-light)] ml-auto">자동 업데이트</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-sm whitespace-nowrap">
            🔥 성수 새 카페 오픈
          </span>
          <span className="bg-purple-50 text-purple-500 px-3 py-1 rounded-full text-sm whitespace-nowrap">
            🎪 팝업 D-3
          </span>
          <span className="bg-blue-50 text-blue-500 px-3 py-1 rounded-full text-sm whitespace-nowrap">
            🌤️ 맑음 3°C
          </span>
        </div>
      </section>

      {/* Main Actions */}
      <section className="grid grid-cols-3 gap-3 mb-6">
        <Link
          to="/couple-sync"
          className="bg-white rounded-2xl p-4 shadow-sm text-center hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-2">💕</div>
          <div className="font-semibold text-sm">커플싱크</div>
          <div className="text-xs text-[var(--text-light)]">함께 고르기</div>
        </Link>

        <Link
          to="/category"
          className="bg-white rounded-2xl p-4 shadow-sm text-center hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-2">📂</div>
          <div className="font-semibold text-sm">카테고리</div>
          <div className="text-xs text-[var(--text-light)]">뭐할지 모를때</div>
        </Link>

        <Link
          to="/chat"
          className="bg-white rounded-2xl p-4 shadow-sm text-center hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-2">💬</div>
          <div className="font-semibold text-sm">채팅</div>
          <div className="text-xs text-[var(--text-light)]">대화하기</div>
        </Link>
      </section>

      {/* AI Recommendation */}
      <section className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-2xl p-4 text-white mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🎯</span>
          <span className="font-semibold">AI 맞춤 추천</span>
        </div>
        <p className="text-sm opacity-90 mb-3">최근 대화와 선택을 분석했어요</p>
        <Link
          to="/recommend"
          className="block bg-white text-[var(--primary)] text-center py-2 rounded-xl font-semibold"
        >
          "파스타 + 카페 코스 어떠세요?"
        </Link>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-4">
        <div className="flex justify-around max-w-md mx-auto">
          <Link to="/" className="flex flex-col items-center text-[var(--primary)]">
            <span className="text-xl">🏠</span>
            <span className="text-xs">홈</span>
          </Link>
          <Link to="/category" className="flex flex-col items-center text-[var(--text-light)]">
            <span className="text-xl">📍</span>
            <span className="text-xs">탐색</span>
          </Link>
          <Link to="/chat" className="flex flex-col items-center text-[var(--text-light)]">
            <span className="text-xl">💬</span>
            <span className="text-xs">채팅</span>
          </Link>
          <Link to="/" className="flex flex-col items-center text-[var(--text-light)]">
            <span className="text-xl">👤</span>
            <span className="text-xs">마이</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
