export default function IconButton({ label, children, className = '', variant = 'quiet', type = 'button', ...props }) {
  const classes = variant === 'dark' ? 'text-[var(--dh-surface)] hover:bg-white/10' : variant === 'danger' ? 'text-[var(--dh-liked)] hover:bg-[color-mix(in_srgb,var(--dh-liked)_8%,transparent)]' : 'text-[var(--dh-muted)] hover:text-[var(--dh-text)] hover:bg-[color-mix(in_srgb,var(--dh-primary)_8%,transparent)]'
  return <button type={type} aria-label={label} title={label} className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-control transition-colors ${classes} ${className}`} {...props}>{children}</button>
}
