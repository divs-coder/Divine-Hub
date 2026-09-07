export function formatRelativeTime(value) {
  if (!value) return ''
  const date = new Date(value)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 45) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatCount(value = 0) {
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatTimestamp(value) {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function formatPresence(isOnline, lastSeen) {
  if (isOnline) return 'Online'
  if (!lastSeen) return 'Offline'
  return `Last seen ${formatRelativeTime(lastSeen)} ago`
}
