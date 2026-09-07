export default function PageHeader({ eyebrow, title, description, action }) {
  return <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--dh-border)] px-5 pb-5 pt-7 sm:px-8 sm:pt-10"><div className="min-w-0 space-y-2"><p className="meta uppercase tracking-[.14em] text-[var(--dh-primary)]">{eyebrow}</p><h1 className="text-[28px] font-semibold tracking-[-.04em] sm:text-[32px]">{title}</h1>{description && <p className="max-w-2xl text-sm leading-6 text-[var(--dh-muted)]">{description}</p>}</div>{action}</header>
}
