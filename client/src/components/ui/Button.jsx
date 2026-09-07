import LoadingSpinner from './LoadingSpinner.jsx'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  quiet: 'btn-quiet',
  danger: 'btn-quiet btn-danger',
}

export default function Button({ variant = 'primary', loading = false, loadingLabel = 'Working…', children, className = '', type = 'button', disabled = false, ...props }) {
  return <button type={type} className={`${variants[variant] || variants.primary} ${className}`} disabled={loading || disabled} {...props}>
    {loading ? <><LoadingSpinner size="sm" label={loadingLabel} /> <span>{loadingLabel}</span></> : children}
  </button>
}
