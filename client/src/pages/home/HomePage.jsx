import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import PostComposer from '../../components/posts/PostComposer.jsx'
import PostCard from '../../components/posts/PostCard.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { listPosts } from '../../services/postService.js'
import { getErrorMessage } from '../../utils/errors.js'

export default function HomePage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const sentinelRef = useRef(null)
  const load = useCallback(async (nextCursor = null, replace = false) => { if (nextCursor ? loadingMore : !loading) return; if (nextCursor) setLoadingMore(true); else setLoading(true); setError(''); try { const response = await listPosts(nextCursor ? { cursor: nextCursor } : {}); setPosts((current) => replace || !nextCursor ? response.data : [...current, ...response.data]); setCursor(response.meta?.nextCursor || null); setHasMore(Boolean(response.meta?.hasMore)) } catch (requestError) { setError(getErrorMessage(requestError, 'Your feed could not be loaded.')) } finally { setLoading(false); setLoadingMore(false) } }, [loading, loadingMore])
  useEffect(() => { load(null, true) }, [])
  useEffect(() => { const node = sentinelRef.current; if (!node) return undefined; const observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting && hasMore && cursor && !loadingMore) load(cursor) }, { rootMargin: '500px' }); observer.observe(node); return () => observer.disconnect() }, [cursor, hasMore, loadingMore, load])
  const addPost = (post) => setPosts((current) => [post, ...current])
  const removePost = (id) => setPosts((current) => current.filter((post) => post.id !== id))
  const updatePost = (next) => setPosts((current) => current.map((post) => post.id === next.id ? next : post))
  return <><PageHeader eyebrow="Home" title="Your courtyard" description="A quieter feed for the things you want to share." action={<Link to="/create" className="btn-primary"><ArrowRight size={16} /> Create post</Link>} /><div className="mx-auto max-w-3xl px-5 py-6 sm:px-8"><PostComposer user={user} onPublished={addPost} /><div className="mt-7 space-y-5">{loading ? [1, 2].map((item) => <div key={item} className="surface space-y-4 rounded-card p-5"><div className="flex items-center gap-3"><Skeleton className="h-12 w-12 rounded-full" /><div className="space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-2.5 w-20" /></div></div><Skeleton className="h-20 w-full" /><Skeleton className="h-9 w-full" /></div>) : error ? <ErrorState message={error} onRetry={() => load(null, true)} /> : posts.length ? posts.map((post) => <PostCard key={post.id} post={post} onRemoved={removePost} onUpdated={updatePost} />) : <EmptyState title="Your feed is quiet for now." description="Follow someone or share your first post to give it a little life." action={<Link to="/explore" className="btn-secondary">Find people</Link>} />}{!loading && !error && <div ref={sentinelRef} className="flex min-h-12 items-center justify-center">{loadingMore && <span className="meta">Loading earlier posts…</span>}{!hasMore && posts.length > 0 && <span className="meta">You’re all caught up.</span>}</div>}</div></div></>
}
