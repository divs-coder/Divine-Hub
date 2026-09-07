export default function TypingIndicator({ visible }) { return visible ? <p className="text-xs text-[var(--dh-muted)]" role="status">User is typing…</p> : <span className="h-4" aria-hidden="true" /> }
