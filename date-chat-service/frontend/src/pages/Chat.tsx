import { useState } from 'react'
import { Link } from 'react-router-dom'

interface Message {
  id: string
  sender: 'me' | 'partner'
  text: string
  time: string
}

const sampleMessages: Message[] = [
  { id: '1', sender: 'partner', text: '오늘 뭐 먹을까?', time: '14:32' },
  { id: '2', sender: 'me', text: '파스타 어때? 요즘 땡겨', time: '14:33' },
  { id: '3', sender: 'partner', text: '좋아! 성수쪽 괜찮은 데 있을까?', time: '14:34' },
]

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(sampleMessages)
  const [inputText, setInputText] = useState('')
  const [detectedKeywords] = useState(['파스타', '성수'])

  const handleSend = () => {
    if (!inputText.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: inputText,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages([...messages, newMessage])
    setInputText('')
    // TODO: Socket.io로 메시지 전송 & AI 분석
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 bg-white border-b">
        <Link to="/" className="text-2xl">←</Link>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">👫</div>
          <div>
            <h1 className="font-bold">민수 & 수진</h1>
            <span className="text-xs text-green-500">● 온라인</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                message.sender === 'me'
                  ? 'bg-[var(--primary)] text-white rounded-br-sm'
                  : 'bg-white shadow-sm rounded-bl-sm'
              }`}
            >
              <p>{message.text}</p>
              <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-pink-200' : 'text-gray-400'}`}>
                {message.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Detection Banner */}
      {detectedKeywords.length > 0 && (
        <div className="mx-4 mb-2 bg-blue-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <span>💡</span>
            <span className="font-semibold text-sm">AI 감지</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {detectedKeywords.map((keyword) => (
                <span key={keyword} className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
                  {keyword}
                </span>
              ))}
            </div>
            <Link
              to="/recommend"
              className="text-[var(--primary)] text-sm font-semibold"
            >
              맞춤 추천 보기 →
            </Link>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="메시지를 입력하세요..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  )
}
