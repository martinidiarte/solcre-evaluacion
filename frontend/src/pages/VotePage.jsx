import { useEffect, useState } from 'react'
import '../App.css'

function VotePage() {
  const [candidates, setCandidates] = useState([])
  const [document, setDocument] = useState('')
  const [candidateId, setCandidateId] = useState('')
  const [message, setMessage] = useState('')
useEffect(() => {
  fetch('http://localhost:8000/candidates')
    .then((response) => response.json())
    .then((data) => {
      setCandidates(data)
    })
  }, [])
function handleVote() {
  fetch('http://localhost:8000/votes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      document: document,
      candidate_id: Number(candidateId)
    })
  })
    .then(async (response) => {
      const data = await response.json()

      if (!response.ok) {
        setMessage(data.detail)
        return
      }

      setMessage('Voto registrado correctamente')
    })
}
  return (
    <div className="page">
      <section id="center" className="card">
        <h1 className="app-title">Sistema de Votación</h1>
        <div className="form-group">
          <label className="form-label">Documento</label>
          <input type="text"
            className="form-input"
            value={document}
            onChange={(event) => setDocument(event.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">Candidato</label>
          <select
            className="form-select"
            value={candidateId}
            onChange={(event) => setCandidateId(event.target.value)}>
            <option value="">Seleccione su candidato</option>

            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name} {candidate.last_name}
              </option>
            ))

            }
          </select>
        </div>
        <button type="button" className="btn-primary" onClick={handleVote}>
          Votar
        </button>
        {message && (
          <p className={`message ${message === 'Voto registrado correctamente' ? 'message-success' : 'message-error'}`}>
            {message}
          </p>
        )}
      </section>
    </div>
  )
}

export default VotePage
