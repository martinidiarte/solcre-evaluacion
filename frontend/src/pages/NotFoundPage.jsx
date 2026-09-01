import { useNavigate } from 'react-router-dom'
import '../App.css'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <section className="card" role="alert">
        <h1 className="app-title">Página no encontrada</h1>
        <p className="message message-error">
          La dirección ingresada no existe.
        </p>
        <button type="button" className="btn-primary" onClick={() => navigate('/', { replace: true })}>
          Volver al inicio
        </button>
      </section>
    </div>
  )
}

export default NotFoundPage
