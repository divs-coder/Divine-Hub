import api from './api.js'

export async function searchPeople(query, signal) {
  const { data } = await api.get('/users/search', { params: { q: query }, signal })
  return data.data
}

export async function getProfile(username) {
  const { data } = await api.get(`/users/${encodeURIComponent(username)}`)
  return data.data
}

export async function updateProfile(payload) {
  const { data } = await api.put('/users/profile', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
  return data.data
}

export async function followUser(userId) {
  const { data } = await api.post(`/users/${userId}/follow`)
  return data.data
}

export async function unfollowUser(userId) {
  const { data } = await api.delete(`/users/${userId}/follow`)
  return data.data
}

export async function updateSettings(payload) {
  const { data } = await api.put('/users/settings', payload)
  return data.data
}

export async function deleteAccount(username) {
  await api.delete('/users/account', { data: { username } })
}
