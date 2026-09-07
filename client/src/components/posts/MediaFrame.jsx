export default function MediaFrame({ media, username }) {
  if (!media) return null
  const src = media.url?.startsWith('http') ? media.url : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'}${media.url}`
  if (media.type === 'video') return <div className="overflow-hidden rounded-media bg-[var(--dh-ink-950)]"><video className="max-h-[70dvh] w-full object-contain" src={src} controls preload="metadata"><track kind="captions" /></video></div>
  return <div className="overflow-hidden rounded-media bg-[var(--dh-ink-950)]"><img className="max-h-[70dvh] w-full object-contain" src={src} loading="lazy" alt={`Post media from @${username}`} /></div>
}
