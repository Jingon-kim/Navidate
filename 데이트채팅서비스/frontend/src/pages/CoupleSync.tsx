import { useState } from 'react'
import { Link } from 'react-router-dom'

interface Place {
  id: string
  name: string
  category: string
  image: string
  description: string
}

const samplePlaces: Place[] = [
  { id: '1', name: '어반플랜트', category: '카페', image: '☕', description: '성수동 · 브런치 맛집' },
  { id: '2', name: '대림창고', category: '카페', image: '🎨', description: '성수동 · 갤러리 카페' },
  { id: '3', name: '피자 마시타', category: '맛집', image: '🍕', description: '홍대 · 화덕피자' },
]

export default function CoupleSync() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mySelections, setMySelections] = useState<Record<string, boolean>>({})
  const [partnerSelections] = useState<Record<string, boolean>>({ '1': true }) // 시뮬레이션
  const [matched, setMatched] = useState<string[]>([])

  const currentPlace = samplePlaces[currentIndex]

  const handleSwipe = (liked: boolean) => {
    const placeId = currentPlace.id
    setMySelections({ ...mySelections, [placeId]: liked })

    // 매칭 확인 (둘 다 좋아요)
    if (liked && partnerSelections[placeId]) {
      setMatched([...matched, placeId])
    }

    // 다음 장소로
    if (currentIndex < samplePlaces.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const partnerLiked = partnerSelections[currentPlace?.id]

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <Link to="/" className="text-2xl">←</Link>
        <h1 className="text-xl font-bold">💕 커플 싱크</h1>
        <div className="w-8"></div>
      </header>

      {/* Partner Status */}
      <div className="flex justify-center gap-8 mb-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-xl mb-1">👧</div>
          <span className="text-sm">나</span>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl mb-1">👦</div>
          <span className="text-sm">상대</span>
          {partnerLiked !== undefined && (
            <div className="text-xs mt-1">
              {partnerLiked ? '✅ 좋아요!' : '❌ 패스'}
            </div>
          )}
        </div>
      </div>

      {/* Matched Count */}
      {matched.length > 0 && (
        <div className="bg-green-50 text-green-600 rounded-xl p-3 text-center mb-4">
          🎉 {matched.length}개 장소 매칭됨!
        </div>
      )}

      {/* Place Card */}
      {currentPlace ? (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
          <div className="h-48 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-6xl">
            {currentPlace.image}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{currentPlace.category}</span>
            </div>
            <h2 className="text-xl font-bold mb-1">{currentPlace.name}</h2>
            <p className="text-[var(--text-light)]">{currentPlace.description}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold mb-2">모든 장소를 확인했어요!</h2>
          <p className="text-[var(--text-light)]">
            {matched.length > 0 ? `${matched.length}개 장소가 매칭되었어요` : '아쉽게도 매칭된 장소가 없어요'}
          </p>
        </div>
      )}

      {/* Swipe Buttons */}
      {currentPlace && (
        <div className="flex justify-center gap-8">
          <button
            onClick={() => handleSwipe(false)}
            className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl hover:bg-gray-200 transition-colors"
          >
            ❌
          </button>
          <button
            onClick={() => handleSwipe(true)}
            className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center text-2xl text-white hover:bg-[var(--primary-dark)] transition-colors"
          >
            ❤️
          </button>
        </div>
      )}

      {/* Progress */}
      <div className="mt-6 text-center text-[var(--text-light)] text-sm">
        {currentIndex + 1} / {samplePlaces.length}
      </div>
    </div>
  )
}
