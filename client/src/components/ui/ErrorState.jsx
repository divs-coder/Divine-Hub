import { AlertCircle, RefreshCw } from 'lucide-react'
import Button from './Button.jsx'

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return <div className="grid min-h-52 place-items-center px-5 py-12 text-center"><div className="max-w-sm space-y-3"><AlertCircle className="mx-auto h-8 w-8 text-[var(--dh-liked)]" strokeWidth={1.5} aria-hidden="true" /><h2 className="text-lg font-semibold">Couldn’t load this view</h2><p className="text-sm leading-6 text-[var(--dh-muted)]">{message}</p>{onRetry && <Button variant="secondary" onClick={onRetry}><RefreshCw size={16} /> Retry</Button>}</div></div>
}
