import { Link } from 'react-router-dom'

interface DateCourse {
  time: string
  icon: string
  name: string
  location: string
  description: string
  travelTime?: string
}

const recommendedCourse: DateCourse[] = [
  {
    time: '12:00',
    icon: '🍝',
    name: '어반플랜트',
    location: '성수',
    description: '파스타 맛집 · 분위기 좋음',
    travelTime: '도보 5분',
  },
  {
    time: '14:00',
    icon: '☕',
    name: '대림창고',
    location: '성수',
    description: '갤러리 카페 · 사진 찍기 좋음',
    travelTime: '도보 8분',
  },
  {
    time: '16:00',
    icon: '🎨',
    name: 'LCDC SEOUL',
    location: '성수',
    description: '무료 전시 · 오늘까지!',
  },
]

export default function Recommend() {
  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <Link to="/" className="text-2xl">←</Link>
        <h1 className="text-xl font-bold">📍 맞춤 추천</h1>
      </header>

      {/* Recommendation Reason */}
      <section className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-2xl p-4 text-white mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span>🎯</span>
          <span className="font-semibold">추천 이유</span>
        </div>
        <p className="text-sm opacity-90">
          두 분의 최근 대화에서 "파스타", "성수" 키워드가 감지되었고,
          지난 3번의 데이트에서 브런치 카페를 선호하셨어요.
        </p>
      </section>

      {/* Date Course */}
      <section className="mb-6">
        <h2 className="font-bold text-lg mb-4">오늘의 데이트 코스</h2>

        <div className="space-y-4">
          {recommendedCourse.map((course, index) => (
            <div key={index}>
              <div className="flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className="text-sm font-semibold text-[var(--primary)]">{course.time}</div>
                  <div className="w-0.5 flex-1 bg-gray-200 mt-2"></div>
                </div>

                {/* Card */}
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                      {course.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{course.name}</h3>
                      <p className="text-sm text-[var(--text-light)]">{course.description}</p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{course.location}</span>
                  </div>
                </div>
              </div>

              {/* Travel Time */}
              {course.travelTime && (
                <div className="ml-12 pl-4 py-2 text-sm text-[var(--text-light)]">
                  → {course.travelTime}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Today's Info */}
      <section className="bg-blue-50 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span>📅</span>
          <span className="font-semibold">오늘의 정보</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span>🌤️</span>
            <span>맑음 3°C - 실내 위주 추천</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎨</span>
            <span className="text-red-500 font-semibold">LCDC 전시 오늘 마지막!</span>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
          다른 추천 보기
        </button>
        <Link
          to="/couple-sync"
          className="flex-1 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-center hover:bg-[var(--primary-dark)] transition-colors"
        >
          코스 확정하기
        </Link>
      </div>
    </div>
  )
}
