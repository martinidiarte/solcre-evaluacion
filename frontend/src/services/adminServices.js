import { authFetch } from './api'

export function validateAdminSession() {
  return authFetch('http://localhost:8000/admin/me')
}

//Para manejar la paginación de los votos por api
export function getVotes(page = 1, pageSize = 15) {
  return authFetch(`http://localhost:8000/votes?page=${page}&page_size=${pageSize}`)
}

export function getMostVoted() {
  return authFetch('http://localhost:8000/candidates/most-voted')
}

export function getVoteId(id) {
  return authFetch(`http://localhost:8000/votes/${id}`)
}

export function addVoter(voter) {
  return authFetch('http://localhost:8000/voter', {
    method: 'POST',
    body: JSON.stringify(voter)
  })
}

export function changePass(passwords) {
  return authFetch('http://localhost:8000/admin/change-password', {
    method: 'POST',
    body: JSON.stringify(passwords)
  }, {
    handledUnauthorizedDetails: ['Contraseña incorrecta']
  })
}
