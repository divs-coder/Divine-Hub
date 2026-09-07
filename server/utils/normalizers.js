export function normalizeUsername(value = '') {
  return value.trim().replace(/^@/, '').toLowerCase()
}

export function normalizeEmail(value = '') {
  return value.trim().toLowerCase()
}

export function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
