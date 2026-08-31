import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import { getMostVoted, getVotes, getVoteId, addVoter, changePass } from '../services/adminServices'


function AdminPage() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('ranking')

  const [ranking, setRanking] = useState([])
  const [rankingMessage, setRankingMessage] = useState('')

  const [votes, setVotes] = useState([])
  const [votesMessage, setVotesMessage] = useState('')
  const [votesPage, setVotesPage] = useState(1)
  const votesPerPage = 5

  const [voteDetail, setVoteDetail] = useState(null)
  const [voteDetailMessage, setVoteDetailMessage] = useState('')

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

  function handleLogout() {
    sessionStorage.removeItem('access_token')
    navigate('/')
  }

  function loadRanking() {
    setActiveSection('ranking')
    getMostVoted()
      .then(async (response) => {
        if (!response) return

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
    getVotes()
      .then(async (response) => {
        if (!response) return

        const data = await response.json()

        if (!response.ok) {
          setVotesMessage(data.detail)
          return
        }

        setVotesMessage('')
        setVotes(data)
        setVotesPage(1)
      })
  }

  function loadVoteDetail(id) {
    setVoteDetailMessage('')
    getVoteId(id)
      .then(async (response) => {
        if (!response) return

        const data = await response.json()

        if (!response.ok) {
          setVoteDetailMessage(data.detail)
          return
        }

        setVoteDetail(data)
      })
  }

  function closeVoteDetail() {
    setVoteDetail(null)
    setVoteDetailMessage('')
  }

  useEffect(() => {
    loadRanking()
  }, [])

  function handleAddVoter(event) {
    event.preventDefault()

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

    if (!/^\d+$/.test(voterPhone)) {
        setVoterMessage('El teléfono solo debe contener dígitos')
        return
    }

    const today = new Date()
    const birthDate = new Date(voterDob)
    
    if (birthDate > today) {
        setVoterMessage('La fecha de nacimiento no puede ser futura')
        return
    }

    const adultDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
    )

    if (birthDate > adultDate) {
        setVoterMessage('El votante debe ser mayor de 18 años')
        return
    }
    addVoter({
      name: voterName,
      last_name: voterLastName,
      document: voterDocument,
      dob: voterDob,
      is_candidate: voterIsCandidate,
      address: voterAddress,
      telephone_number: voterPhone,
      sex: voterSex
    })       
      .then(async (response) => {
        if (!response) return

        const data = await response.json()


        if (!response.ok) {
          setVoterMessage(data.detail)
          return
        }

        setVoterMessage('Votante agregado correctamente')
      })
  }

  function handleChangePassword(event) {
    event.preventDefault()
    if (
        !oldPassword.trim() ||
        !newPassword.trim() ||
        !confirmNewPassword.trim()
    ) {
        setPasswordMessage('Todos los campos son obligatorios')
        return
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage('Las contraseñas no coinciden')
      return
    }
    changePass({
      old_password: oldPassword,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword
    })
      .then(async (response) => {
        if (!response) return

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
        <div className="modal-header">
          <h1 className="app-title">Panel de administración</h1>
          <button type="button" className="btn-table-action btn-danger" onClick={handleLogout}>
            Cerrar Sesion
          </button>
        </div>

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
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((candidate, index) => {
                  const totalRankingVotes = ranking.reduce((sum, item) => sum + item.number_votes, 0)
                  const percentage = totalRankingVotes > 0 ? (candidate.number_votes / totalRankingVotes) * 100 : 0

                  return (
                    <tr key={candidate.id}>
                      <td>{index + 1}</td>
                      <td>{candidate.name} {candidate.last_name}</td>
                      <td>{candidate.number_votes}</td>
                      <td>
                        <div className="progress-row">
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="progress-label">{percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'votes' && (
          <div className="tab-content">
            {votesMessage && <p className="message message-error">{votesMessage}</p>}
            {ranking.length > 0 && (() => {
              const totalRankingVotes = ranking.reduce((sum, item) => sum + item.number_votes, 0)
              const percentage = totalRankingVotes > 0 ? (ranking[0].number_votes / totalRankingVotes) * 100 : 0

              return (
                <div className="highlight-card">
                  <div className="highlight-info">
                    <span className="detail-label">Mas votado</span>
                    <div className="highlight-name-row">
                      <span className="highlight-name">{ranking[0].name} {ranking[0].last_name}</span>
                      <span className="highlight-votes-badge">{ranking[0].number_votes} votos</span>
                    </div>
                    <div className="progress-row">
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="progress-label">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )
            })()}
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
                {votes.slice((votesPage - 1) * votesPerPage, votesPage * votesPerPage).map((vote) => (
                  <tr key={vote.id}>
                    <td>{vote.voter_name} {vote.voter_last_name}</td>
                    <td>{vote.candidate_name} {vote.candidate_last_name}</td>
                    <td>{new Date(vote.voted_at).toLocaleString()}</td>
                    <td className="actions-cell">
                      <button type="button" className="btn-table-action"
                        onClick={() => loadVoteDetail(vote.id)}>
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {votes.length > 0 && (
              <div className="pagination">
                <button type="button" className="btn-table-action"
                  disabled={votesPage === 1}
                  onClick={() => setVotesPage((page) => page - 1)}>
                  Anterior
                </button>
                <span className="pagination-info">
                  Página {votesPage} de {Math.ceil(votes.length / votesPerPage)}
                </span>
                <button type="button" className="btn-table-action"
                  disabled={votesPage >= Math.ceil(votes.length / votesPerPage)}
                  onClick={() => setVotesPage((page) => page + 1)}>
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}

        {activeSection === 'addVoter' && (
          <div className="tab-content">
            <form className="form-stack" onSubmit={handleAddVoter}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input type="text" className="form-input"
                    placeholder="Ej: Juan"
                    value={voterName}
                    onChange={(event) => setVoterName(event.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Apellido</label>
                  <input type="text" className="form-input"
                    placeholder="Ej: Pérez"
                    value={voterLastName}
                    onChange={(event) => setVoterLastName(event.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Documento</label>
                  <input type="text" className="form-input"
                    placeholder="Ej: 12345678"
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
                    placeholder="Ej: Av. Siempreviva 742"
                    value={voterAddress}
                    onChange={(event) => setVoterAddress(event.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input type="text" className="form-input"
                    placeholder="Ej: 1122334455"
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
              <button type="submit" className="btn-primary">
                Agregar votante
              </button>
            </form>
            {voterMessage && (
              <p className={`message ${voterMessage === 'Votante agregado correctamente' ? 'message-success' : 'message-error'}`}>
                {voterMessage}
              </p>
            )}
          </div>
        )}

        {activeSection === 'password' && (
          <div className="tab-content">
            <form className="form-stack" onSubmit={handleChangePassword}>
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
              <button type="submit" className="btn-primary">
                Cambiar contraseña
              </button>
            </form>
            {passwordMessage && (
              <p className={`message ${passwordMessage === 'Contraseña actualizada correctamente' ? 'message-success' : 'message-error'}`}>
                {passwordMessage}
              </p>
            )}
          </div>
        )}
      </section>

      {(voteDetail || voteDetailMessage) && (
        <div className="modal-overlay" onClick={closeVoteDetail}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2 className="app-title">Detalle del voto</h2>
              <button type="button" className="btn-table-action" onClick={closeVoteDetail}>
                Cerrar
              </button>
            </div>

            {voteDetailMessage && <p className="message message-error">{voteDetailMessage}</p>}

            {voteDetail && (
              <div className="detail-list">
                <div className="detail-row">
                  <span className="detail-label">Votante</span>
                  <span className="detail-value">{voteDetail.voter_name} {voteDetail.voter_last_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Documento</span>
                  <span className="detail-value">{voteDetail.voter_document}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Fecha de nacimiento</span>
                  <span className="detail-value">{voteDetail.voter_dob}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Dirección</span>
                  <span className="detail-value">{voteDetail.voter_address}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Teléfono</span>
                  <span className="detail-value">{voteDetail.voter_telephone_number}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Sexo</span>
                  <span className="detail-value">{voteDetail.voter_sex}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Candidato</span>
                  <span className="detail-value">{voteDetail.candidate_name} {voteDetail.candidate_last_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Fecha del voto</span>
                  <span className="detail-value">{new Date(voteDetail.voted_at).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage
