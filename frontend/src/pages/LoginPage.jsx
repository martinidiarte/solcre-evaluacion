import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
function handleLogin(event) {
  event.preventDefault()
  fetch('http://localhost:8000/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })
    .then(async (response) => {
      const data = await response.json()

        console.log(data)

      if (!response.ok) {
        setMessage(data.detail)
        return
      }
      // Guardo el token 
      sessionStorage.setItem('access_token', data.access_token)
      setMessage('Ingreso Exitoso')
      // Redirecciono 
      navigate('/admin')
    })
}
  return (
    <div className="page">
      <section id="center" className="card">
        <div className="modal-header">
          <h1 className="app-title">Ingresar</h1>
          <button type="button" className="btn-table-action" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
        <form className="form-stack" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email </label>
            <input type="text"
              className="form-input"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña </label>
            <input type="password"
              className="form-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}/>
          </div>
          <button type="submit" className="btn-primary">
            Ingresar
          </button>
        </form>
        {message && (
          <p className={`message ${message === 'Ingreso Exitoso' ? 'message-success' : 'message-error'}`}>
            {message}
          </p>
        )}
      </section>
    </div>
  )
}

export default LoginPage
