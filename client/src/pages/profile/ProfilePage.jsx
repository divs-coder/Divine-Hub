import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ProfileHeader from '../../components/profile/ProfileHeader.jsx'
import ProfileEditForm from '../../components/profile/ProfileEditForm.jsx'
import PostCard from '../../components/posts/PostCard.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import { getProfile, updateProfile, followUser, unfollowUser } from '../../services/userService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../components/ui/ToastProvider.jsx'
import { getErrorMessage } from '../../utils/errors.js'

export default function ProfilePage() {
  const { username } = useParams()
  const { user: currentUser, refreshUser, setUser } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const isOwner = username === 'me' || username === currentUser?.username
  const load = () => { setLoading(true); setError(''); getProfile(isOwner ? currentUser.username : username).then((data) => setProfile(data)).catch((requestError) => setError(getErrorMessage(requestError, 'Profile unavailable.'))).finally(() => setLoading(false)) }
  useEffect(() => { if (currentUser) load() }, [username, currentUser?.username])
  const handleFollow = async (target) => { setFollowLoading(true); try { const data = target.relationship === 'following' ? await unfollowUser(target.id) : await followUser(target.id); setProfile((current) => ({ ...current, user: { ...current.user, relationship: data.relationship, followersCount: data.followersCount } })) } catch (requestError) { push({ tone: 'error', message: getErrorMessage(requestError, 'Could not update that follow.') }) } finally { setFollowLoading(false) } }
  const handleSave = async (form) => { const data = await updateProfile(form); setProfile((current) => ({ ...current, user: data.user })); setUser(data.user); await refreshUser(); push({ tone: 'success', message: 'Profile updated' }) }
  if (loading) return <><PageHeader eyebrow="Profile" title="Loading profile" /><div className="mx-5 mt-6 space-y-4 sm:mx-8"><Skeleton className="h-56 rounded-card" /><Skeleton className="h-8 w-1/3" /><Skeleton className="h-32 rounded-card" /></div></>
  if (error) return <><PageHeader eyebrow="Profile" title="Profile unavailable" /><ErrorState message={error} onRetry={load} /></>
  if (!profile) return null
  return <><PageHeader eyebrow="Profile" title={`@${profile.user.username}`} /><ProfileHeader user={profile.user} isOwner={isOwner} onEdit={() => setEditOpen(true)} onFollow={isOwner ? undefined : handleFollow} onMessage={isOwner ? undefined : () => navigate(`/messages/${profile.user.id}`)} followLoading={followLoading} /><section className="mx-auto max-w-3xl px-5 py-8 sm:px-8"><div className="mb-4 flex items-baseline justify-between"><h2 className="text-lg font-semibold">Posts</h2><span className="meta">{profile.posts.length} total</span></div>{profile.isPrivate ? <EmptyState title="This account is private" description="Follow this person to see their posts." /> : profile.posts.length ? <div className="space-y-5">{profile.posts.map((post) => <PostCard key={post.id} post={post} />)}</div> : <EmptyState title="No posts yet." description={isOwner ? 'Share something from your home feed.' : 'There is nothing here yet.'} />}</section><ProfileEditForm open={editOpen} onClose={() => setEditOpen(false)} user={profile.user} onSave={handleSave} /></>
}
