export default function LoadingSpinner({ label = 'Loading', size = 'md' }) {
  const sizeClass = size === 'sm' ? 'h-4 w-4 border-2' : 'h-6 w-6 border-[3px]'
  return <span className="inline-flex items-center gap-2" role="status"><span className={`${sizeClass} animate-spin rounded-full border-[var(--dh-primary)] border-t-transparent`} aria-hidden="true" /><span className="sr-only">{label}</span></span>
}
