import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { validateAdminSession } from '../services/adminServices'
import Loader from './Loader'

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem('access_token')
  const [status, setStatus] = useState(token ? 'checking' : 'unauthenticated')

  useEffect(() => {
    if (!token) return

    let active = true

    async function validateSession() {
      try {
        const response = await validateAdminSession()
        if (active && response?.ok) setStatus('authenticated')
        else if (active) setStatus('unauthenticated')
      } catch {
        if (active) {
          sessionStorage.removeItem('access_token')
          setStatus('unauthenticated')
        }
      }
    }

    validateSession()
    return () => { active = false }
  }, [token])

  if (status === 'checking') {
    return (
      <div className="loader-slot">
        <Loader label="Validando sesión" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedRoute
