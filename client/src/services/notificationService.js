import api from './api.js'

export async function listNotifications() {
  const { data } = await api.get('/notifications')
  return data
}

export async function markNotificationRead(notificationId) {
  const { data } = await api.put(`/notifications/${notificationId}/read`)
  return data.data.notification
}

export async function markAllNotificationsRead() {
  await api.put('/notifications/read-all')
}
