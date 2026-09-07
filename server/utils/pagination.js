export function getLimit(value, fallback = 20, maximum = 50) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.min(Math.floor(parsed), maximum)
}

export function getCursorDate(cursor) {
  if (!cursor) return null
  const date = new Date(cursor)
  return Number.isNaN(date.getTime()) ? null : date
}

export function getPageMeta(items, limit) {
  const hasMore = items.length > limit
  const visibleItems = hasMore ? items.slice(0, limit) : items
  const nextCursor = hasMore ? visibleItems.at(-1)?.createdAt?.toISOString() : null
  return { items: visibleItems, hasMore, nextCursor }
}
