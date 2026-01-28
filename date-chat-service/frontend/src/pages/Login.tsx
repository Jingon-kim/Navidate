import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 로그인 로직 구현
    console.log('Login:', { email, password })
  }

  return (
    <div className="min-h-screen flex flex-col justify-center p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--primary)] mb-2">NaviDate</h1>
        <p className="text-[var(--text-light)]">둘이 함께 고르는 데이트</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:outline-none"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-semibold hover:bg-[var(--primary-dark)] transition-colors"
        >
          로그인
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[var(--text-light)]">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-[var(--primary)] font-semibold">
            회원가입
          </Link>
        </p>
      </div>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[var(--background)] text-[var(--text-light)]">또는</span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <button className="w-full py-3 border border-gray-200 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
            <span>🔵</span> 카카오로 시작하기
          </button>
        </div>
      </div>
    </div>
  )
}
