import { Link } from 'react-router-dom'

const categories = [
  { id: 'food', icon: '🍽️', name: '맛집', color: 'bg-orange-50 text-orange-500' },
  { id: 'cafe', icon: '☕', name: '카페', color: 'bg-amber-50 text-amber-600' },
  { id: 'movie', icon: '🎬', name: '영화', color: 'bg-red-50 text-red-500' },
  { id: 'game', icon: '🎮', name: '오락', color: 'bg-purple-50 text-purple-500' },
  { id: 'activity', icon: '🏃', name: '액티비티', color: 'bg-green-50 text-green-500' },
  { id: 'walk', icon: '🌳', name: '산책', color: 'bg-emerald-50 text-emerald-500' },
  { id: 'shopping', icon: '🛍️', name: '쇼핑', color: 'bg-pink-50 text-pink-500' },
  { id: 'exhibition', icon: '🎨', name: '전시', color: 'bg-indigo-50 text-indigo-500' },
  { id: 'bar', icon: '🍺', name: '술집', color: 'bg-yellow-50 text-yellow-600' },
  { id: 'karaoke', icon: '🎤', name: '노래방', color: 'bg-rose-50 text-rose-500' },
  { id: 'park', icon: '🎡', name: '놀이공원', color: 'bg-cyan-50 text-cyan-500' },
  { id: 'random', icon: '🎲', name: '랜덤', color: 'bg-gray-50 text-gray-500' },
]

export default function Category() {
  const handleCategoryClick = (categoryId: string) => {
    // TODO: 카테고리 선택 후 추천 페이지로 이동
    console.log('Selected category:', categoryId)
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <Link to="/" className="text-2xl">←</Link>
        <h1 className="text-xl font-bold">카테고리</h1>
      </header>

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">오늘 뭐 할까?</h2>
        <p className="text-[var(--text-light)]">카테고리를 골라보세요!</p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-3 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`${category.color} rounded-2xl p-4 text-center hover:scale-105 transition-transform`}
          >
            <div className="text-3xl mb-2">{category.icon}</div>
            <div className="font-semibold text-sm">{category.name}</div>
          </button>
        ))}
      </div>

      {/* Recent Selection */}
      <section className="mt-8">
        <h3 className="font-semibold mb-3">최근 선택한 카테고리</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <span className="bg-white px-4 py-2 rounded-full text-sm shadow-sm">☕ 카페</span>
          <span className="bg-white px-4 py-2 rounded-full text-sm shadow-sm">🍽️ 맛집</span>
          <span className="bg-white px-4 py-2 rounded-full text-sm shadow-sm">🎨 전시</span>
        </div>
      </section>

      {/* AI Suggestion */}
      <section className="mt-6 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span>💡</span>
          <span className="font-semibold">AI 추천</span>
        </div>
        <p className="text-sm text-[var(--text-light)]">
          두 분의 취향을 분석한 결과, <strong className="text-[var(--primary)]">카페 + 전시</strong> 조합을 추천드려요!
        </p>
      </section>
    </div>
  )
}
