import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react'
import IconButton from '../ui/IconButton.jsx'
import { formatCount } from '../../utils/formatters.js'

export default function PostActions({ post, onLike, onComment, onSave, onShare, loading = false }) {
  return <div className="flex flex-wrap items-center gap-1 border-t border-[var(--dh-border)] pt-2"><button type="button" className={`btn-quiet gap-1.5 ${post.isLiked ? 'text-[var(--dh-liked)]' : ''}`} onClick={onLike} disabled={loading} aria-label={post.isLiked ? 'Unlike' : 'Like'}><Heart size={18} fill={post.isLiked ? 'currentColor' : 'none'} /> <span>{formatCount(post.likesCount || 0)}</span></button><button type="button" className="btn-quiet gap-1.5" onClick={onComment} aria-label="Comment"><MessageCircle size={18} /> <span>{formatCount(post.commentsCount || 0)}</span></button><button type="button" className={`btn-quiet gap-1.5 ${post.isSaved ? 'text-[var(--dh-primary)]' : ''}`} onClick={onSave} disabled={loading} aria-label={post.isSaved ? 'Unsave' : 'Save'}><Bookmark size={18} fill={post.isSaved ? 'currentColor' : 'none'} /><span className="hidden sm:inline">{post.isSaved ? 'Saved' : 'Save'}</span></button><IconButton label="Share" onClick={onShare}><Share2 size={18} /></IconButton></div>
}
