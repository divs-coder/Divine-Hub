import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar.jsx'
import IconButton from '../ui/IconButton.jsx'
import ConfirmationDialog from '../ui/ConfirmationDialog.jsx'
import PostActions from './PostActions.jsx'
import CommentSection from './CommentSection.jsx'
import MediaFrame from './MediaFrame.jsx'
import { deletePost, likePost, unlikePost, savePost, unsavePost } from '../../services/postService.js'
import { formatRelativeTime } from '../../utils/formatters.js'
import { getErrorMessage } from '../../utils/errors.js'
import { useToast } from '../ui/ToastProvider.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function PostCard({ post, onRemoved, onUpdated }) {
  const [localPost, setLocalPost] = useState(post)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { push } = useToast()
  const { user } = useAuth()
  const isOwner = localPost.canDelete || localPost.author?.id === user?.id
  const update = (next) => { setLocalPost(next); onUpdated?.(next) }
  const toggleLike = async () => { const previous = localPost; update({ ...localPost, isLiked: !localPost.isLiked, likesCount: Math.max((localPost.likesCount || 0) + (localPost.isLiked ? -1 : 1), 0) }); setLoading(true); try { const next = localPost.isLiked ? await unlikePost(localPost.id) : await likePost(localPost.id); update(next) } catch (error) { update(previous); push({ tone: 'error', message: getErrorMessage(error, 'Like could not be updated.') }) } finally { setLoading(false) } }
  const toggleSave = async () => { const previous = localPost; update({ ...localPost, isSaved: !localPost.isSaved }); setLoading(true); try { const data = localPost.isSaved ? await unsavePost(localPost.id) : await savePost(localPost.id); update({ ...localPost, isSaved: data.isSaved }) } catch (error) { update(previous); push({ tone: 'error', message: getErrorMessage(error, 'Save could not be updated.') }) } finally { setLoading(false) } }
  const share = async () => { const url = `${window.location.origin}/?post=${localPost.id}`; try { if (navigator.share) await navigator.share({ title: `Post by @${localPost.author.username}`, url }); else { await navigator.clipboard.writeText(url); push({ tone: 'success', message: 'Link copied' }) } } catch (error) { if (error.name !== 'AbortError') push({ tone: 'error', message: 'Link could not be shared.' }) } }
  const remove = async () => { setLoading(true); try { await deletePost(localPost.id); onRemoved?.(localPost.id); push({ tone: 'success', message: 'Post deleted' }); setConfirmOpen(false) } catch (error) { push({ tone: 'error', message: getErrorMessage(error, 'Post could not be deleted.') }) } finally { setLoading(false) } }
  return <article className="surface rounded-card p-4 sm:p-5"><header className="flex items-start gap-3"><Link to={`/profile/${localPost.author.username}`}><Avatar user={localPost.author} size="md" /></Link><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Link to={`/profile/${localPost.author.username}`} className="truncate text-sm font-semibold hover:text-[var(--dh-primary)]">{localPost.author.fullName}</Link><span className="text-[var(--dh-muted)]">·</span><span className="meta">{formatRelativeTime(localPost.createdAt)}</span></div><Link to={`/profile/${localPost.author.username}`} className="text-xs text-[var(--dh-muted)]">@{localPost.author.username}</Link></div>{isOwner && <IconButton label="Post options" onClick={() => setConfirmOpen(true)}><MoreHorizontal size={19} /></IconButton>}</header>{localPost.text && <p className="mt-4 whitespace-pre-wrap text-[16px] leading-7">{localPost.text}</p>}{localPost.media && <div className="mt-4"><MediaFrame media={localPost.media} username={localPost.author.username} /></div>}<div className="mt-4"><PostActions post={localPost} onLike={toggleLike} onComment={() => setCommentsOpen((value) => !value)} onSave={toggleSave} onShare={share} loading={loading} /></div>{commentsOpen && <div className="mt-3"><CommentSection post={localPost} onCountChange={(count) => update({ ...localPost, commentsCount: count })} /></div>}<ConfirmationDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={remove} loading={loading} title="Delete post?" description="This post and its comments will be permanently removed." /></article>
}
