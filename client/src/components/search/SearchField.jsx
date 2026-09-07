import { Search, X } from 'lucide-react'
import IconButton from '../ui/IconButton.jsx'

export default function SearchField({ value, onChange, onClear, placeholder = 'Search people', autoFocus = false }) {
  return <div className="flex items-center gap-2 rounded-control border border-[var(--dh-border)] bg-[var(--dh-surface)] px-3 transition focus-within:border-[var(--dh-primary)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--dh-primary)_18%,transparent)]"><Search className="h-5 w-5 shrink-0 text-[var(--dh-muted)]" aria-hidden="true" /><input className="min-h-12 min-w-0 flex-1 bg-transparent text-base text-[var(--dh-text)] outline-none placeholder:text-[var(--dh-muted)]" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} autoFocus={autoFocus} />{value && <IconButton label="Clear search" onClick={onClear}><X size={17} /></IconButton>}</div>
}
