import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import { getMostVoted, getVotes, getVoteId, addVoter, changePass } from '../services/adminServices'
import Loader from '../components/Loader'
import { getApiErrors } from '../utils/apiErrors'


function AdminPage() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('ranking')

  const [ranking, setRanking] = useState([])
  const [rankingMessage, setRankingMessage] = useState('')

  const [votes, setVotes] = useState([])
  const [votesMessage, setVotesMessage] = useState('')
  const [votesPage, setVotesPage] = useState(1)
  const [votesTotalPages, setVotesTotalPages] = useState(0)
  const votesPerPage = 15

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
  const [voterFieldErrors, setVoterFieldErrors] = useState({})
  const [voterApiMessage, setVoterApiMessage] = useState('')
  const [voterSuccessMessage, setVoterSuccessMessage] = useState('')

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({})
  const [passwordApiMessage, setPasswordApiMessage] = useState('')
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('')

  const [loadingSection, setLoadingSection] = useState('')
  const [isAddingVoter, setIsAddingVoter] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  function handleLogout() {
    sessionStorage.removeItem('access_token')
    navigate('/')
  }

  async function loadRanking() {
    setActiveSection('ranking')
    setLoadingSection('ranking')
    setRankingMessage('')
    try {
      const response = await getMostVoted()
      if (!response) return
      const data = await response.json()
      if (!response.ok) {
        setRankingMessage(data.detail)
        return
      }
      setRanking(data)
    } catch {
      setRankingMessage('No se pudo cargar el ranking')
    } finally {
      setLoadingSection('')
    }
  }

  async function loadVotes(page = 1) {
    setActiveSection('votes')
    setLoadingSection('votes')
    setVotesMessage('')
    try {
      const response = await getVotes(page, votesPerPage)
      if (!response) return
      const data = await response.json()
      if (!response.ok) {
        setVotesMessage(data.detail)
        return
      }
      setVotes(data.items)
      setVotesPage(data.page)
      setVotesTotalPages(data.total_pages)
    } catch {
      setVotesMessage('No se pudo cargar el listado de votos')
    } finally {
      setLoadingSection('')
    }
  }

  async function loadVoteDetail(id) {
    setVoteDetailMessage('')
    setLoadingSection('detail')
    try {
      const response = await getVoteId(id)
      if (!response) return
      const data = await response.json()
      if (!response.ok) {
        setVoteDetailMessage(data.detail)
        return
      }
      setVoteDetail(data)
    } catch {
      setVoteDetailMessage('No se pudo cargar el detalle del voto')
    } finally {
      setLoadingSection('')
    }
  }

  function closeVoteDetail() {
    setVoteDetail(null)
    setVoteDetailMessage('')
  }

  useEffect(() => {
    async function loadInitialRanking() {
      await loadRanking()
    }
    loadInitialRanking()
  }, [])

  function updateVoterField(field, value, setter) {
    setter(value)
    setVoterFieldErrors((errors) => ({ ...errors, [field]: '' }))
    setVoterSuccessMessage('')
  }

  function resetVoterForm() {
    setVoterName('')
    setVoterLastName('')
    setVoterDocument('')
    setVoterDob('')
    setVoterIsCandidate(false)
    setVoterAddress('')
    setVoterPhone('')
    setVoterSex('')
  }

  async function handleAddVoter(event) {
    event.preventDefault()
    if (isAddingVoter) return

    const errors = {}
    if (!voterName.trim()) errors.name = 'El nombre es requerido'
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/.test(voterName.trim())) errors.name = 'El nombre solo puede contener letras y espacios'
    if (!voterLastName.trim()) errors.lastName = 'El apellido es requerido'
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/.test(voterLastName.trim())) errors.lastName = 'El apellido solo puede contener letras y espacios'
    if (!voterDocument.trim()) errors.document = 'El documento es requerido'
    if (!voterDob) errors.dob = 'La fecha de nacimiento es requerida'
    if (!voterAddress.trim()) errors.address = 'La dirección es requerida'
    if (!voterPhone.trim()) errors.phone = 'El teléfono es requerido'
    else if (!/^\d+$/.test(voterPhone)) errors.phone = 'El teléfono debe contener solo números'
    if (!voterSex) errors.sex = 'El sexo es requerido'

    const today = new Date()
    const birthDate = new Date(voterDob)
    if (voterDob) {
      if (birthDate > today) {
        errors.dob = 'La fecha de nacimiento no puede ser futura'
      } else {
        const adultDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
        if (birthDate > adultDate) errors.dob = 'El votante debe ser mayor de 18 años'
      }
    }

    setVoterFieldErrors(errors)
    setVoterApiMessage('')
    setVoterSuccessMessage('')
    if (Object.keys(errors).length > 0) return

    setIsAddingVoter(true)
    try {
      const response = await addVoter({
        name: voterName,
        last_name: voterLastName,
        document: voterDocument,
        dob: voterDob,
        is_candidate: voterIsCandidate,
        address: voterAddress,
        telephone_number: voterPhone,
        sex: voterSex
      })
      if (!response) return
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setVoterFieldErrors({ document: data.detail })
          return
        }
        const { fieldErrors, generalError } = getApiErrors(data.detail, {
          name: 'name', last_name: 'lastName', document: 'document', dob: 'dob',
          address: 'address', telephone_number: 'phone', sex: 'sex'
        })
        setVoterFieldErrors(fieldErrors)
        setVoterApiMessage(generalError)
        return
      }

      resetVoterForm()
      setVoterSuccessMessage('Votante agregado correctamente')
    } catch {
      setVoterApiMessage('No se pudo conectar con la API')
    } finally {
      setIsAddingVoter(false)
    }
  }

  function updatePasswordField(field, value, setter) {
    setter(value)
    setPasswordFieldErrors((errors) => {
      if (field === 'newPassword' || field === 'confirmNewPassword') {
        return { ...errors, newPassword: '', confirmNewPassword: '' }
      }
      return { ...errors, [field]: '' }
    })
    setPasswordSuccessMessage('')
  }

  async function handleChangePassword(event) {
    event.preventDefault()
    if (isChangingPassword) return

    const errors = {}
    if (!oldPassword.trim()) errors.oldPassword = 'La contraseña actual es requerida'
    if (!newPassword.trim()) errors.newPassword = 'La nueva contraseña es requerida'
    if (!confirmNewPassword.trim()) errors.confirmNewPassword = 'Debe confirmar la nueva contraseña'
    else if (newPassword !== confirmNewPassword) {
      errors.newPassword = 'Las contraseñas no coinciden'
      errors.confirmNewPassword = 'Las contraseñas no coinciden'
    }

    setPasswordFieldErrors(errors)
    setPasswordApiMessage('')
    setPasswordSuccessMessage('')
    if (Object.keys(errors).length > 0) return

    setIsChangingPassword(true)
    try {
      const response = await changePass({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword
      })
      if (!response) return
      const data = await response.json()

      if (!response.ok) {
        if (data.detail === 'Contraseña incorrecta') setPasswordFieldErrors({ oldPassword: data.detail })
        else if (data.detail === 'La nueva contraseña debe ser diferente a la actual') setPasswordFieldErrors({ newPassword: data.detail })
        else if (data.detail === 'Las contraseñas no coinciden') {
          setPasswordFieldErrors({ newPassword: data.detail, confirmNewPassword: data.detail })
        }
        else setPasswordApiMessage(data.detail)
        return
      }

      setPasswordSuccessMessage(data.message)
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch {
      setPasswordApiMessage('No se pudo conectar con la API')
    } finally {
      setIsChangingPassword(false)
    }
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
            disabled={loadingSection === 'ranking'}
            onClick={loadRanking}>
            Ranking
          </button>
          <button type="button"
            className={`tab-button ${activeSection === 'votes' ? 'tab-button-active' : ''}`}
            disabled={loadingSection === 'votes'}
            onClick={() => loadVotes(1)}>
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
            {loadingSection === 'ranking' && (
              <div className="loader-slot">
                <Loader label="Cargando ranking" />
              </div>
            )}
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
            {loadingSection === 'votes' && (
              <div className="loader-slot">
                <Loader label="Cargando votos" />
              </div>
            )}
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
                {votes.map((vote) => (
                  <tr key={vote.id}>
                    <td>{vote.voter_name} {vote.voter_last_name}</td>
                    <td>{vote.candidate_name} {vote.candidate_last_name}</td>
                    <td>{new Date(vote.voted_at).toLocaleString()}</td>
                    <td className="actions-cell">
                      <button type="button" className="btn-table-action"
                        disabled={loadingSection === 'detail'}
                        onClick={() => loadVoteDetail(vote.id)}>
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {votesTotalPages > 0 && (
              <div className="pagination">
                <button type="button" className="btn-table-action"
                  disabled={votesPage === 1}
                  onClick={() => loadVotes(votesPage - 1)}>
                  Anterior
                </button>
                <span className="pagination-info">
                  Página {votesPage} de {votesTotalPages}
                </span>
                <button type="button" className="btn-table-action"
                  disabled={votesPage >= votesTotalPages}
                  onClick={() => loadVotes(votesPage + 1)}>
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}

        {activeSection === 'addVoter' && (
          <div className="tab-content">
            <form className="form-stack" onSubmit={handleAddVoter} noValidate>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="voter-name">Nombre <span className="required-mark">*</span></label>
                  <input id="voter-name" type="text" className={`form-input ${voterFieldErrors.name ? 'form-control-invalid' : ''}`}
                    aria-invalid={Boolean(voterFieldErrors.name)}
                    placeholder="Ej: Juan"
                    value={voterName}
                    onChange={(event) => updateVoterField('name', event.target.value, setVoterName)}/>
                  {voterFieldErrors.name && <span className="field-error">{voterFieldErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="voter-last-name">Apellido <span className="required-mark">*</span></label>
                  <input id="voter-last-name" type="text" className={`form-input ${voterFieldErrors.lastName ? 'form-control-invalid' : ''}`}
                    aria-invalid={Boolean(voterFieldErrors.lastName)}
                    placeholder="Ej: Pérez"
                    value={voterLastName}
                    onChange={(event) => updateVoterField('lastName', event.target.value, setVoterLastName)}/>
                  {voterFieldErrors.lastName && <span className="field-error">{voterFieldErrors.lastName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="voter-document">Documento <span className="required-mark">*</span></label>
                  <input id="voter-document" type="text" className={`form-input ${voterFieldErrors.document ? 'form-control-invalid' : ''}`}
                    aria-invalid={Boolean(voterFieldErrors.document)}
                    placeholder="Ej: 12345678"
                    value={voterDocument}
                    onChange={(event) => updateVoterField('document', event.target.value, setVoterDocument)}/>
                  {voterFieldErrors.document && <span className="field-error">{voterFieldErrors.document}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="voter-dob">Fecha de nacimiento <span className="required-mark">*</span></label>
                  <input id="voter-dob" type="date" className={`form-input ${voterFieldErrors.dob ? 'form-control-invalid' : ''}`}
                    aria-invalid={Boolean(voterFieldErrors.dob)}
                    value={voterDob}
                    onChange={(event) => updateVoterField('dob', event.target.value, setVoterDob)}/>
                  {voterFieldErrors.dob && <span className="field-error">{voterFieldErrors.dob}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="voter-address">Dirección <span className="required-mark">*</span></label>
                  <input id="voter-address" type="text" className={`form-input ${voterFieldErrors.address ? 'form-control-invalid' : ''}`}
                    aria-invalid={Boolean(voterFieldErrors.address)}
                    placeholder="Ej: Av. Siempreviva 742"
                    value={voterAddress}
                    onChange={(event) => updateVoterField('address', event.target.value, setVoterAddress)}/>
                  {voterFieldErrors.address && <span className="field-error">{voterFieldErrors.address}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="voter-phone">Teléfono <span className="required-mark">*</span></label>
                  <input id="voter-phone" type="text" className={`form-input ${voterFieldErrors.phone ? 'form-control-invalid' : ''}`}
                    aria-invalid={Boolean(voterFieldErrors.phone)}
                    placeholder="Ej: 1122334455"
                    value={voterPhone}
                    onChange={(event) => updateVoterField('phone', event.target.value, setVoterPhone)}/>
                  {voterFieldErrors.phone && <span className="field-error">{voterFieldErrors.phone}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="voter-sex">Sexo <span className="required-mark">*</span></label>
                  <select id="voter-sex" className={`form-select ${voterFieldErrors.sex ? 'form-control-invalid' : ''}`}
                    aria-invalid={Boolean(voterFieldErrors.sex)}
                    value={voterSex}
                    onChange={(event) => updateVoterField('sex', event.target.value, setVoterSex)}>
                    <option value="">Seleccione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {voterFieldErrors.sex && <span className="field-error">{voterFieldErrors.sex}</span>}
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
              <button type="submit" className="btn-primary" disabled={isAddingVoter}>
                {isAddingVoter ? 'Agregando votante…' : 'Agregar votante'}
              </button>
              {isAddingVoter && (
                <div className="loader-slot"><Loader label="Agregando votante" /></div>
              )}
            </form>
            {voterSuccessMessage && <p className="message message-success">{voterSuccessMessage}</p>}
            {voterApiMessage && <p className="message message-error">{voterApiMessage}</p>}
          </div>
        )}

        {activeSection === 'password' && (
          <div className="tab-content">
            <form className="form-stack" onSubmit={handleChangePassword} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="old-password">Contraseña actual <span className="required-mark">*</span></label>
                <input id="old-password" type="password" className={`form-input ${passwordFieldErrors.oldPassword ? 'form-control-invalid' : ''}`}
                  aria-invalid={Boolean(passwordFieldErrors.oldPassword)}
                  value={oldPassword}
                  onChange={(event) => updatePasswordField('oldPassword', event.target.value, setOldPassword)}/>
                {passwordFieldErrors.oldPassword && <span className="field-error">{passwordFieldErrors.oldPassword}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">Nueva contraseña <span className="required-mark">*</span></label>
                <input id="new-password" type="password" className={`form-input ${passwordFieldErrors.newPassword ? 'form-control-invalid' : ''}`}
                  aria-invalid={Boolean(passwordFieldErrors.newPassword)}
                  value={newPassword}
                  onChange={(event) => updatePasswordField('newPassword', event.target.value, setNewPassword)}/>
                {passwordFieldErrors.newPassword && <span className="field-error">{passwordFieldErrors.newPassword}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">Confirmar nueva contraseña <span className="required-mark">*</span></label>
                <input id="confirm-password" type="password" className={`form-input ${passwordFieldErrors.confirmNewPassword ? 'form-control-invalid' : ''}`}
                  aria-invalid={Boolean(passwordFieldErrors.confirmNewPassword)}
                  value={confirmNewPassword}
                  onChange={(event) => updatePasswordField('confirmNewPassword', event.target.value, setConfirmNewPassword)}/>
                {passwordFieldErrors.confirmNewPassword && <span className="field-error">{passwordFieldErrors.confirmNewPassword}</span>}
              </div>
              <button type="submit" className="btn-primary" disabled={isChangingPassword}>
                {isChangingPassword ? 'Actualizando…' : 'Cambiar contraseña'}
              </button>
              {isChangingPassword && (
                <div className="loader-slot"><Loader label="Actualizando contraseña" /></div>
              )}
            </form>
            {passwordSuccessMessage && <p className="message message-success">{passwordSuccessMessage}</p>}
            {passwordApiMessage && <p className="message message-error">{passwordApiMessage}</p>}
          </div>
        )}
      </section>

      {(voteDetail || voteDetailMessage || loadingSection === 'detail') && (
        <div className="modal-overlay" onClick={closeVoteDetail}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2 className="app-title">Detalle del voto</h2>
              <button type="button" className="btn-table-action" onClick={closeVoteDetail}>
                Cerrar
              </button>
            </div>

            {voteDetailMessage && <p className="message message-error">{voteDetailMessage}</p>}
            {loadingSection === 'detail' && (
              <div className="loader-slot">
                <Loader label="Cargando detalle del voto" />
              </div>
            )}

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
