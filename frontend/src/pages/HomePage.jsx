import { useNavigate } from 'react-router-dom'
import '../App.css'

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <section className="card">
        <button type="button" className="btn-table-action btn-corner" onClick={() => navigate('/admin/login')}>
          Ingresar
        </button>
        <h1 className="app-title">Bienvenido</h1>
        <button type="button" className="btn-primary" onClick={() => navigate('/votar')}>
          Continuar como votante
        </button>
      </section>
    </div>
  )
}

export default HomePage
