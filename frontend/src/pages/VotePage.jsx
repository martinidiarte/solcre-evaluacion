import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'
import { getApiErrors } from '../utils/apiErrors'
import '../App.css'

function VotePage() {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [document, setDocument] = useState('')
  const [candidateId, setCandidateId] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiMessage, setApiMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadCandidates() {
      try {
        const response = await fetch('http://localhost:8000/candidates')
        const data = await response.json()
        if (!response.ok) {
          setApiMessage(data.detail)
          return
        }
        setCandidates(data)
      } catch {
        setApiMessage('No se pudieron cargar los candidatos')
      } finally {
        setIsLoadingCandidates(false)
      }
    }

    loadCandidates()
  }, [])

  function updateField(field, value, setter) {
    setter(value)
    setFieldErrors((errors) => ({ ...errors, [field]: '' }))
    setSuccessMessage('')
  }

  async function handleVote(event) {
    event.preventDefault()
    if (isSubmitting) return

    const errors = {}
    if (!document.trim()) errors.document = 'El documento es requerido'
    if (!candidateId) errors.candidateId = 'Debe seleccionar un candidato'

    setFieldErrors(errors)
    setApiMessage('')
    setSuccessMessage('')
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      const response = await fetch('http://localhost:8000/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document, candidate_id: Number(candidateId) })
      })
      const data = await response.json()

      if (!response.ok) {
        const { fieldErrors: apiFieldErrors, generalError } = getApiErrors(data.detail, {
          document: 'document',
          candidate_id: 'candidateId'
        })
        setFieldErrors(apiFieldErrors)
        setApiMessage(generalError)
        return
      }

      setSuccessMessage('Voto registrado correctamente')
      setDocument('')
      setCandidateId('')
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
          <h1 className="app-title">Sistema de Votación</h1>
          <button type="button" className="btn-table-action" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
        <form className="form-stack" onSubmit={handleVote} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="vote-document">Documento <span className="required-mark">*</span></label>
            <input id="vote-document" type="text"
              className={`form-input ${fieldErrors.document ? 'form-control-invalid' : ''}`}
              aria-invalid={Boolean(fieldErrors.document)}
              placeholder="Ej: 12345678"
              value={document}
              onChange={(event) => updateField('document', event.target.value, setDocument)}/>
            {fieldErrors.document && <span className="field-error">{fieldErrors.document}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="vote-candidate">Candidato <span className="required-mark">*</span></label>
            <select id="vote-candidate"
              className={`form-select ${fieldErrors.candidateId ? 'form-control-invalid' : ''}`}
              aria-invalid={Boolean(fieldErrors.candidateId)}
              value={candidateId}
              disabled={isLoadingCandidates}
              onChange={(event) => updateField('candidateId', event.target.value, setCandidateId)}>
              <option value="">Seleccione su candidato</option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name} {candidate.last_name}
                </option>
              ))}
            </select>
            {fieldErrors.candidateId && <span className="field-error">{fieldErrors.candidateId}</span>}
          </div>
          <button type="submit" className="btn-primary" disabled={isSubmitting || isLoadingCandidates}>
            {isSubmitting ? 'Registrando voto…' : 'Votar'}
          </button>
          {(isLoadingCandidates || isSubmitting) && (
            <div className="loader-slot">
              <Loader label={isSubmitting ? 'Registrando voto' : 'Cargando candidatos'} />
            </div>
          )}
        </form>
        {successMessage && <p className="message message-success">{successMessage}</p>}
        {apiMessage && <p className="message message-error">{apiMessage}</p>}
      </section>
    </div>
  )
}

export default VotePage
