export default function OfflineBar({ socketStatus }) {
  const offline = typeof navigator !== 'undefined' && !navigator.onLine
  if (!offline && !['reconnecting', 'unavailable'].includes(socketStatus)) return null
  const message = offline ? 'You’re offline. New actions will be available when you reconnect.' : 'Real-time updates paused. Reconnecting…'
  return <div className="border-b border-[color-mix(in_srgb,var(--dh-warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--dh-warning)_12%,transparent)] px-4 py-2 text-center text-xs text-[var(--dh-warning)]" role="status">{message}</div>
}
