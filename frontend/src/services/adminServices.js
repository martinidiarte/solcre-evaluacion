import { authFetch } from './api'

export function getVotes() {
  return authFetch('http://localhost:8000/votes')
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
  })
}