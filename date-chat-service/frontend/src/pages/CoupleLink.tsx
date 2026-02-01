import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { coupleAPI } from '../services/api'
import { useAuthStore } from '../stores/authStore'

export default function CoupleLink() {
  const [partnerCode, setPartnerCode] = useState('')
  const [myCode, setMyCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    // 로그인 체크
    if (!localStorage.getItem('userId')) {
      navigate('/login')
      return
    }

    // 커플 코드 생성
    const generateCode = async () => {
      try {
        const response = await coupleAPI.createCode()
        setMyCode(response.code)
      } catch (err) {
        console.error('코드 생성 실패:', err)
        // 임시 코드 생성
        setMyCode(`${Math.random().toString(36).substring(2, 5).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`)
      }
    }

    generateCode()
  }, [navigate])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(myCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLink = async () => {
    if (partnerCode.length < 8) return

    setIsLoading(true)
    setError('')

    try {
      await coupleAPI.joinCouple(partnerCode)
      await checkAuth() // 사용자 정보 갱신
      navigate('/category')
    } catch (err: any) {
      setError(err.response?.data?.error || '커플 연결에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">💕</div>
        <h1 className="text-2xl font-bold mb-2">커플 연결하기</h1>
        <p className="text-[var(--text-light)]">상대방과 코드를 공유해서 연결하세요</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* 내 코드 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <p className="text-sm text-[var(--text-light)] mb-2">내 커플 코드</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 rounded-xl py-3 px-4 text-center text-2xl font-mono font-bold tracking-wider">
            {myCode || '로딩...'}
          </div>
          <button
            onClick={handleCopyCode}
            disabled={!myCode}
            className="px-4 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold disabled:opacity-50"
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
          disabled={partnerCode.length < 8 || isLoading}
          className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--primary-dark)] transition-colors"
        >
          {isLoading ? '연결 중...' : '연결하기'}
        </button>
      </div>

      {/* 건너뛰기 */}
      <button
        onClick={() => navigate('/category')}
        className="mt-6 text-[var(--text-light)] text-sm underline"
      >
        나중에 연결하기
      </button>
    </div>
  )
}
