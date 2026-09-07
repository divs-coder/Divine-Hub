import api from './api.js'

export async function listConversations() {
  const { data } = await api.get('/messages/conversations')
  return data.data
}

export async function listMessages(userId) {
  const { data } = await api.get(`/messages/${userId}`)
  return data
}

export async function sendMessage(payload) {
  const { data } = await api.post('/messages', payload)
  return data.data.message
}

export async function markMessageRead(messageId) {
  const { data } = await api.put(`/messages/${messageId}/read`)
  return data.data.message
}

export async function deleteMessage(messageId) {
  const { data } = await api.delete(`/messages/${messageId}`)
  return data.data.message
}
