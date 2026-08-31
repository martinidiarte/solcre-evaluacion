import LoginPage from './pages/LoginPage'
import VotePage from './pages/VotePage'
import AdminPage from './pages/AdminPage'
import VoteDetail from './pages/VoteDetail'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VotePage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/votes/:id" element={<VoteDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App