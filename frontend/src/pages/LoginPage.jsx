import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'
import '../App.css'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiMessage, setApiMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(field, value, setter) {
    setter(value)
    setFieldErrors((errors) => ({ ...errors, [field]: '' }))
  }

  async function handleLogin(event) {
    event.preventDefault()
    if (isSubmitting) return

    const errors = {}
    if (!email.trim()) errors.email = 'El email es requerido'
    if (!password.trim()) errors.password = 'La contraseña es requerida'

    setFieldErrors(errors)
    setApiMessage('')
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      const response = await fetch('http://localhost:8000/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()

      if (!response.ok) {
        setApiMessage(data.detail)
        return
      }

      sessionStorage.setItem('access_token', data.access_token)
      navigate('/admin')
    } catch {
      setApiMessage('No se pudo conectar con la API')
    } finally {
      setIsSubmitting(false)
    }
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
        <form className="form-stack" onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email <span className="required-mark">*</span></label>
            <input id="login-email" type="text"
              className={`form-input ${fieldErrors.email ? 'form-control-invalid' : ''}`}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(event) => updateField('email', event.target.value, setEmail)}/>
            {fieldErrors.email && <span id="login-email-error" className="field-error">{fieldErrors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Contraseña <span className="required-mark">*</span></label>
            <input id="login-password" type="password"
              className={`form-input ${fieldErrors.password ? 'form-control-invalid' : ''}`}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
              value={password}
              onChange={(event) => updateField('password', event.target.value, setPassword)}/>
            {fieldErrors.password && <span id="login-password-error" className="field-error">{fieldErrors.password}</span>}
          </div>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando…' : 'Ingresar'}
          </button>
          {isSubmitting && (
            <div className="loader-slot"><Loader label="Iniciando sesión" /></div>
          )}
        </form>
        {apiMessage && <p className="message message-error">{apiMessage}</p>}
      </section>
    </div>
  )
}

export default LoginPage
