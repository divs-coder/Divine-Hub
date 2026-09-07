import { useEffect } from 'react'
import { X } from 'lucide-react'
import IconButton from './IconButton.jsx'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl' }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(15,15,23,.5)] p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className={`w-full ${widths[size] || widths.md} rounded-[20px] bg-[var(--dh-surface)] p-5 text-[var(--dh-text)] shadow-dialog`} role="dialog" aria-modal="true" aria-label={title}>
      <div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">{title}</h2><IconButton label="Close" onClick={onClose}><X size={18} /></IconButton></div>{children}
    </section>
  </div>
}
