import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import VotePage from './pages/VotePage'
import AdminPage from './pages/AdminPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/votar" element={<VotePage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App