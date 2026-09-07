import { useCallback, useEffect, useState } from 'react'
import { Bookmark } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import PostCard from '../../components/posts/PostCard.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { listSavedPosts } from '../../services/postService.js'
import { getErrorMessage } from '../../utils/errors.js'

export default function SavedPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(() => { setLoading(true); setError(''); listSavedPosts().then(setPosts).catch((requestError) => setError(getErrorMessage(requestError, 'Saved posts could not be loaded.'))).finally(() => setLoading(false)) }, [])
  useEffect(() => { load() }, [load])
  return <><PageHeader eyebrow="Saved" title="Things worth keeping" description="Your saved posts, in the same calm reading flow as Home." /><div className="mx-auto max-w-3xl px-5 py-6 sm:px-8">{loading ? <div className="space-y-5">{[1, 2].map((item) => <div className="surface space-y-4 rounded-card p-5" key={item}><Skeleton className="h-10 w-1/3" /><Skeleton className="h-28 w-full" /></div>)}</div> : error ? <ErrorState message={error} onRetry={load} /> : posts.length ? <div className="space-y-5">{posts.map((post) => <PostCard key={post.id} post={post} onRemoved={(id) => setPosts((current) => current.filter((item) => item.id !== id))} onUpdated={(next) => { if (!next.isSaved) setPosts((current) => current.filter((item) => item.id !== next.id)); else setPosts((current) => current.map((item) => item.id === next.id ? next : item)) }} />)}</div> : <EmptyState icon={Bookmark} title="Posts you save will appear here." description="Keep something close when you find it on Home." />}</div></>
}
