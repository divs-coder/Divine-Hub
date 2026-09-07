import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return <div className="grid min-h-52 place-items-center px-5 py-12 text-center"><div className="max-w-sm space-y-3"><Icon className="mx-auto h-8 w-8 text-[var(--dh-muted)]" strokeWidth={1.5} aria-hidden="true" /><h2 className="text-lg font-semibold text-[var(--dh-text)]">{title}</h2>{description && <p className="text-sm leading-6 text-[var(--dh-muted)]">{description}</p>}{action}</div></div>
}
