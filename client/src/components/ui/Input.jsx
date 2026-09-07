import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, error, hint, id, className = '', ...props }, ref) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return <div className="space-y-1.5">
    {label && <label htmlFor={id} className="block text-sm font-medium text-[var(--dh-text)]">{label}{props.required && <span className="ml-1 text-[var(--dh-liked)]" aria-hidden="true">*</span>}</label>}
    <input ref={ref} id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={`field ${error ? 'border-[var(--dh-liked)]' : ''} ${className}`} {...props} />
    {hint && <p id={`${id}-hint`} className="text-xs text-[var(--dh-muted)]">{hint}</p>}
    {error && <p id={`${id}-error`} className="text-xs text-[var(--dh-liked)]" role="alert">{error}</p>}
  </div>
})

export default Input
