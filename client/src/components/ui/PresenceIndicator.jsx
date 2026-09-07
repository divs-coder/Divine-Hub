export default function PresenceIndicator({ isOnline, label = true }) {
  return <span className="inline-flex items-center gap-1.5 text-xs text-[var(--dh-muted)]"><span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-[var(--dh-presence)]' : 'bg-[var(--dh-muted)]'}`} aria-hidden="true" />{label && <span>{isOnline ? 'Online' : 'Offline'}</span>}</span>
}
