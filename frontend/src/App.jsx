import { useEffect, useState } from 'react'
import './App.css'

function App() {
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
    <>
    <section id="center">
      <h1>Sistema de Votación</h1>
        <div>
        <label>Documento </label>
        <input type="text"            
          value={document}
          onChange={(event) => setDocument(event.target.value)}/>
        </div>
        <div>
          <label>Candidato </label>
          <select   
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
      <button type="button" onClick={handleVote}>
        Votar
      </button>
      {message && <p>{message}</p>}
      </section>

      <div className="ticks"></div>

      
    </>
  )
}

export default App
