import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CoupleLink() {
  const [partnerCode, setPartnerCode] = useState('')
  const [myCode] = useState('ABC-1234') // TODO: 서버에서 받아오기
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  const handleCopyCode = () => {
    navigator.clipboard.writeText(myCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLink = () => {
    // TODO: 커플 연결 API 호출
    console.log('Linking with:', partnerCode)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">💕</div>
        <h1 className="text-2xl font-bold mb-2">커플 연결하기</h1>
        <p className="text-[var(--text-light)]">상대방과 코드를 공유해서 연결하세요</p>
      </div>

      {/* 내 코드 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <p className="text-sm text-[var(--text-light)] mb-2">내 커플 코드</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 rounded-xl py-3 px-4 text-center text-2xl font-mono font-bold tracking-wider">
            {myCode}
          </div>
          <button
            onClick={handleCopyCode}
            className="px-4 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold"
          >
            {copied ? '복사됨!' : '복사'}
          </button>
        </div>
      </div>

      {/* 구분선 */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-[var(--background)] text-[var(--text-light)]">또는</span>
        </div>
      </div>

      {/* 상대방 코드 입력 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <p className="text-sm text-[var(--text-light)] mb-2">상대방 코드 입력</p>
        <input
          type="text"
          placeholder="ABC-1234"
          value={partnerCode}
          onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:outline-none text-center text-xl font-mono tracking-wider mb-4"
          maxLength={8}
        />
        <button
          onClick={handleLink}
          disabled={partnerCode.length < 8}
          className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--primary-dark)] transition-colors"
        >
          연결하기
        </button>
      </div>
    </div>
  )
}
