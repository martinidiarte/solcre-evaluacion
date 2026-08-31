import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function AdminPage() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('ranking')

  const [ranking, setRanking] = useState([])
  const [rankingMessage, setRankingMessage] = useState('')

  const [votes, setVotes] = useState([])
  const [votesMessage, setVotesMessage] = useState('')

  const [voterName, setVoterName] = useState('')
  const [voterLastName, setVoterLastName] = useState('')
  const [voterDocument, setVoterDocument] = useState('')
  const [voterDob, setVoterDob] = useState('')
  const [voterIsCandidate, setVoterIsCandidate] = useState(false)
  const [voterAddress, setVoterAddress] = useState('')
  const [voterPhone, setVoterPhone] = useState('')
  const [voterSex, setVoterSex] = useState('')
  const [voterMessage, setVoterMessage] = useState('')

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  function authHeaders() {
    const token = sessionStorage.getItem('access_token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  function loadRanking() {
    setActiveSection('ranking')
    fetch('http://localhost:8000/candidates/most-voted', {
      headers: authHeaders()
    })
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          setRankingMessage(data.detail)
          return
        }

        setRankingMessage('')
        setRanking(data)
      })
  }

  function loadVotes() {
    setActiveSection('votes')
    fetch('http://localhost:8000/votes', {
      headers: authHeaders()
    })
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          setVotesMessage(data.detail)
          return
        }

        setVotesMessage('')
        setVotes(data)
      })
  }

  useEffect(() => {
    loadRanking()
  }, [])

  function handleAddVoter() {

    if (
        !voterName.trim() ||
        !voterLastName.trim() ||
        !voterDocument.trim() ||
        !voterDob ||
        !voterAddress.trim() ||
        !voterPhone.trim() ||
        !voterSex
    ) {
        setVoterMessage('Todos los campos son obligatorios')
        return
    }
    const today = new Date()
    const birthDate = new Date(voterDob)

    if (birthDate > today) {
        setVoterMessage('La fecha de nacimiento no puede ser futura')
        return
    }
    fetch('http://localhost:8000/voter', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        name: voterName,
        last_name: voterLastName,
        document: voterDocument,
        dob: voterDob,
        is_candidate: voterIsCandidate,
        address: voterAddress,
        telephone_number: voterPhone,
        sex: voterSex
      })
    })
        
      .then(async (response) => {
        const data = await response.json()


        if (!response.ok) {
          setVoterMessage(data.detail)
          return
        }

        setVoterMessage('Votante agregado correctamente')
      })
  }

  function handleChangePassword() {
    fetch('http://localhost:8000/admin/change-password', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword
      })
    })
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          setPasswordMessage(data.detail)
          return
        }

        setPasswordMessage(data.message)

        setOldPassword('')
        setNewPassword('')
        setConfirmNewPassword('')
      })
  }

  return (
    <div className="page">
      <section className="card panel">
        <h1 className="app-title">Panel de administración</h1>

        <nav className="tab-nav">
          <button type="button"
            className={`tab-button ${activeSection === 'ranking' ? 'tab-button-active' : ''}`}
            onClick={loadRanking}>
            Ranking
          </button>
          <button type="button"
            className={`tab-button ${activeSection === 'votes' ? 'tab-button-active' : ''}`}
            onClick={loadVotes}>
            Listado de votos
          </button>
          <button type="button"
            className={`tab-button ${activeSection === 'addVoter' ? 'tab-button-active' : ''}`}
            onClick={() => setActiveSection('addVoter')}>
            Agregar votante
          </button>
          <button type="button"
            className={`tab-button ${activeSection === 'password' ? 'tab-button-active' : ''}`}
            onClick={() => setActiveSection('password')}>
            Cambiar contraseña
          </button>
        </nav>

        {activeSection === 'ranking' && (
          <div className="tab-content">
            {rankingMessage && <p className="message message-error">{rankingMessage}</p>}
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Candidato</th>
                  <th>Votos</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((candidate, index) => (
                  <tr key={candidate.id}>
                    <td>{index + 1}</td>
                    <td>{candidate.name} {candidate.last_name}</td>
                    <td>{candidate.number_votes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'votes' && (
          <div className="tab-content">
            {votesMessage && <p className="message message-error">{votesMessage}</p>}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Votante</th>
                  <th>Candidato</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {votes.map((vote) => (
                  <tr key={vote.id}>
                    <td>{vote.voter_name} {vote.voter_last_name}</td>
                    <td>{vote.candidate_name} {vote.candidate_last_name}</td>
                    <td>{new Date(vote.voted_at).toLocaleString()}</td>
                    <td className="actions-cell">
                      <button type="button" className="btn-table-action"
                        onClick={() => navigate(`/admin/votes/${vote.id}`)}>
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'addVoter' && (
          <div className="tab-content">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input type="text" className="form-input"
                  value={voterName}
                  onChange={(event) => setVoterName(event.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">Apellido</label>
                <input type="text" className="form-input"
                  value={voterLastName}
                  onChange={(event) => setVoterLastName(event.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">Documento</label>
                <input type="text" className="form-input"
                  value={voterDocument}
                  onChange={(event) => setVoterDocument(event.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de nacimiento</label>
                <input type="date" className="form-input"
                  value={voterDob}
                  onChange={(event) => setVoterDob(event.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input type="text" className="form-input"
                  value={voterAddress}
                  onChange={(event) => setVoterAddress(event.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input type="text" className="form-input"
                  value={voterPhone}
                  onChange={(event) => setVoterPhone(event.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">Sexo</label>
                <select className="form-select"
                  value={voterSex}
                  onChange={(event) => setVoterSex(event.target.value)}>
                  <option value="">Seleccione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <span className="form-label">¿Es candidato?</span>
                <div className="radio-options">
                  <label className="form-label-radio">
                    <input type="radio"
                      name="isCandidate"
                      checked={voterIsCandidate === true}
                      onChange={() => setVoterIsCandidate(true)}/>
                    Sí
                  </label>
                  <label className="form-label-radio">
                    <input type="radio"
                      name="isCandidate"
                      checked={voterIsCandidate === false}
                      onChange={() => setVoterIsCandidate(false)}/>
                    No
                  </label>
                </div>
              </div>
            </div>
            <button type="button" className="btn-primary" onClick={handleAddVoter}>
              Agregar votante
            </button>
            {voterMessage && (
              <p className={`message ${voterMessage === 'Votante agregado correctamente' ? 'message-success' : 'message-error'}`}>
                {voterMessage}
              </p>
            )}
          </div>
        )}

        {activeSection === 'password' && (
          <div className="tab-content">
            <div className="form-group">
              <label className="form-label">Contraseña actual</label>
              <input type="password" className="form-input"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Nueva contraseña</label>
              <input type="password" className="form-input"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar nueva contraseña</label>
              <input type="password" className="form-input"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}/>
            </div>
            <button type="button" className="btn-primary" onClick={handleChangePassword}>
              Cambiar contraseña
            </button>
            {passwordMessage && (
              <p className={`message ${passwordMessage === 'Contraseña actualizada correctamente' ? 'message-success' : 'message-error'}`}>
                {passwordMessage}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminPage
