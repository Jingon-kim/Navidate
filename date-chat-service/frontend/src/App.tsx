import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CoupleLink from './pages/CoupleLink'
import Category from './pages/Category'
import CoupleSync from './pages/CoupleSync'
import Chat from './pages/Chat'
import Recommend from './pages/Recommend'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--background)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/couple-link" element={<CoupleLink />} />
          <Route path="/category" element={<Category />} />
          <Route path="/couple-sync" element={<CoupleSync />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/recommend" element={<Recommend />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
