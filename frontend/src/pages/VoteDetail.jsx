import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../App.css'

function VoteDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [vote, setVote] = useState(null)
  const [message, setMessage] = useState('')

  function authHeaders() {
    const token = sessionStorage.getItem('access_token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  useEffect(() => {
    fetch(`http://localhost:8000/votes/${id}`, {
      headers: authHeaders()
    })
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          setMessage(data.detail)
          return
        }
        console.log('Respuesta del detalle:', data)
        setVote(data)
      })
  }, [id])

  return (
    <div className="page">
      <section className="card panel">
        <div className="modal-header">
          <h1 className="app-title">Detalle del voto</h1>
          <button type="button" className="btn-table-action" onClick={() => navigate('/admin')}>
            Volver
          </button>
        </div>

        {message && <p className="message message-error">{message}</p>}

        {vote && (
          <div className="detail-list">
            <div className="detail-row">
              <span className="detail-label">Votante</span>
              <span className="detail-value">{vote.voter_name} {vote.voter_last_name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Documento</span>
              <span className="detail-value">{vote.voter_document}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Fecha de nacimiento</span>
              <span className="detail-value">{vote.voter_dob}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Dirección</span>
              <span className="detail-value">{vote.voter_address}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Teléfono</span>
              <span className="detail-value">{vote.voter_telephone_number}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Sexo</span>
              <span className="detail-value">{vote.voter_sex}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Candidato</span>
              <span className="detail-value">{vote.candidate_name} {vote.candidate_last_name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Fecha del voto</span>
              <span className="detail-value">{new Date(vote.voted_at).toLocaleString()}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default VoteDetail
