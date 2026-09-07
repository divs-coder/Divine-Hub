import { Link } from 'react-router-dom'
import DivineHubMark from '../components/brand/DivineHubMark.jsx'

export default function AuthLayout({ children, eyebrow, title, description, footer, footerLink, footerLabel }) {
  return <main className="min-h-screen bg-[var(--dh-page)] lg:grid lg:grid-cols-[minmax(280px,.8fr)_1.2fr]">
    <aside className="hidden flex-col justify-between bg-[var(--dh-ink-950)] p-10 text-[var(--dh-surface)] lg:flex"><DivineHubMark light /><div className="max-w-sm space-y-5"><p className="meta text-[var(--dh-primary-soft)]">{eyebrow}</p><h1 className="text-4xl font-medium leading-tight">A warmer place to keep up with your people.</h1><p className="leading-7 text-white/65">Share what matters, find your people, and keep conversations close — without the noise.</p></div><p className="meta text-white/45">Private by default. Human at the center.</p></aside>
    <section className="flex min-h-screen flex-col justify-center bg-[var(--dh-courtyard)] px-5 py-8 sm:px-10"><div className="mx-auto w-full max-w-md"><div className="mb-8 lg:hidden"><Link to="/"><DivineHubMark compact /></Link></div><div className="mb-8 space-y-3"><p className="meta uppercase tracking-[.16em] text-[var(--dh-primary)]">{eyebrow}</p><h2 className="text-3xl font-semibold tracking-[-.03em]">{title}</h2><p className="leading-6 text-[var(--dh-muted)]">{description}</p></div>{children}<p className="mt-8 text-center text-sm text-[var(--dh-muted)]">{footer} <Link className="font-semibold text-[var(--dh-primary)] hover:underline" to={footerLink}>{footerLabel}</Link></p></div></section>
  </main>
}
