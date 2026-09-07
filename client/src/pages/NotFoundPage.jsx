import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import DivineHubMark from '../components/brand/DivineHubMark.jsx'

export default function NotFoundPage() {
  return <main className="grid min-h-screen place-items-center bg-[var(--dh-page)] px-5 text-center text-[var(--dh-text)]"><div className="max-w-md space-y-5"><DivineHubMark compact /><Compass className="mx-auto h-10 w-10 text-[var(--dh-primary)]" strokeWidth={1.4} /><h1 className="text-3xl font-semibold">Page not found</h1><p className="leading-7 text-[var(--dh-muted)]">The page may have moved or you may not have access.</p><Link className="btn-primary" to="/">Return home</Link></div></main>
}
