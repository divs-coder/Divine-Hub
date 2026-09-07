import { useEffect, useState } from 'react'
import { CornerDownRight, Trash2 } from 'lucide-react'
import Avatar from '../ui/Avatar.jsx'
import IconButton from '../ui/IconButton.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import LoadingSpinner from '../ui/LoadingSpinner.jsx'
import { createComment, deleteComment, listComments } from '../../services/postService.js'
import { formatRelativeTime } from '../../utils/formatters.js'
import { getErrorMessage } from '../../utils/errors.js'
import { useToast } from '../ui/ToastProvider.jsx'

export default function CommentSection({ post, onCountChange }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { push } = useToast()
  useEffect(() => { let active = true; listComments(post.id).then((data) => { if (active) setComments(data) }).catch((error) => push({ tone: 'error', message: getErrorMessage(error, 'Comments could not be loaded.') })).finally(() => active && setLoading(false)); return () => { active = false } }, [post.id])
  const submit = async (event) => { event.preventDefault(); if (!text.trim()) return; setSubmitting(true); try { const comment = await createComment(post.id, text.trim()); setComments((current) => [...current, comment]); setText(''); onCountChange?.(comments.length + 1) } catch (error) { push({ tone: 'error', message: getErrorMessage(error, 'Comment could not be added.') }) } finally { setSubmitting(false) } }
  const remove = async (commentId) => { try { await deleteComment(commentId); setComments((current) => current.filter((comment) => comment.id !== commentId)); onCountChange?.(Math.max(comments.length - 1, 0)) } catch (error) { push({ tone: 'error', message: getErrorMessage(error, 'Comment could not be deleted.') }) } }
  return <div className="space-y-4 border-t border-[var(--dh-border)] pt-4"><div className="flex items-center gap-2 text-sm font-semibold"><CornerDownRight size={16} className="text-[var(--dh-primary)]" /> Comments</div>{loading ? <LoadingSpinner label="Loading comments" size="sm" /> : comments.length ? <div className="space-y-3">{comments.map((comment) => <div key={comment.id} className="flex gap-2.5"><Avatar user={comment.user} size="xs" /><div className="min-w-0 flex-1 rounded-control bg-[var(--dh-courtyard)] px-3 py-2"><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold">@{comment.user.username}</span><span className="meta">{formatRelativeTime(comment.createdAt)}</span>{comment.canDelete && <IconButton label="Delete comment" className="min-h-7 min-w-7" onClick={() => remove(comment.id)}><Trash2 size={13} /></IconButton>}</div><p className="mt-1 whitespace-pre-wrap text-sm leading-5">{comment.text}</p></div></div>)}</div> : <p className="text-sm text-[var(--dh-muted)]">Be the first to comment.</p>}<form className="flex items-end gap-2" onSubmit={submit}><Input id={`comment-${post.id}`} label="Add a comment" className="min-h-11" value={text} onChange={(event) => setText(event.target.value)} placeholder="Add a comment" /><Button type="submit" className="shrink-0" loading={submitting} loadingLabel="Adding…">Comment</Button></form></div>
}
