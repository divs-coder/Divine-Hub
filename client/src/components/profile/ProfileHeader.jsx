import { MessageCircle, Pencil } from 'lucide-react'
import Avatar from '../ui/Avatar.jsx'
import Button from '../ui/Button.jsx'
import ProfileStats from './ProfileStats.jsx'

export default function ProfileHeader({ user, isOwner, onEdit, onFollow, onMessage, followLoading = false }) {
  const following = user.relationship === 'following'
  return <section className="surface mx-5 mt-6 rounded-card p-5 sm:mx-8 sm:p-7"><div className="flex flex-col gap-6 sm:flex-row sm:items-start"><Avatar user={user} size="xl" /><div className="min-w-0 flex-1 space-y-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h1 className="truncate text-2xl font-semibold tracking-[-.03em]">{user.fullName}</h1><p className="mt-1 text-sm text-[var(--dh-muted)]">@{user.username}</p></div><div className="flex shrink-0 gap-2">{isOwner ? <Button variant="secondary" onClick={onEdit}><Pencil size={16} /> Edit profile</Button> : <>{onMessage && user.messagePermission !== 'nobody' && <Button variant="secondary" onClick={() => onMessage(user)}><MessageCircle size={16} /> Message</Button>}{onFollow && <Button onClick={() => onFollow(user)} variant={following ? 'secondary' : 'primary'} loading={followLoading}>{following ? 'Unfollow' : 'Follow'}</Button>}</>}</div></div><p className="max-w-2xl whitespace-pre-wrap text-base leading-7 text-[var(--dh-muted)]">{user.bio || 'No bio yet.'}</p><ProfileStats user={user} /></div></div></section>
}
