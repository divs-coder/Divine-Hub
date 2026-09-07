import { forwardRef } from 'react'

const TextArea = forwardRef(function TextArea({ label, error, id, className = '', ...props }, ref) {
  return <div className="space-y-1.5">
    {label && <label htmlFor={id} className="block text-sm font-medium text-[var(--dh-text)]">{label}{props.required && <span className="ml-1 text-[var(--dh-liked)]" aria-hidden="true">*</span>}</label>}
    <textarea ref={ref} id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={`field min-h-28 resize-y ${error ? 'border-[var(--dh-liked)]' : ''} ${className}`} {...props} />
    {error && <p id={`${id}-error`} className="text-xs text-[var(--dh-liked)]" role="alert">{error}</p>}
  </div>
})

export default TextArea
