import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Video } from 'lucide-react'
import Avatar from '../ui/Avatar.jsx'
import TextArea from '../ui/TextArea.jsx'
import Button from '../ui/Button.jsx'
import UploadTray from './UploadTray.jsx'
import { createPost } from '../../services/postService.js'
import { getErrorMessage } from '../../utils/errors.js'
import { useToast } from '../ui/ToastProvider.jsx'

const MAX_SIZE = 50 * 1024 * 1024

export default function PostComposer({ user, onPublished, expanded = false }) {
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)
  const { push } = useToast()
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])
  const chooseFile = (event) => { const next = event.target.files?.[0]; if (!next) return; setError(''); if (!next.type.startsWith('image/') && !next.type.startsWith('video/')) { setError('Only images and short videos are allowed.'); return } if (next.size > MAX_SIZE) { setError('Image or video is too large.'); return } setFile(next); setPreview(URL.createObjectURL(next)) }
  const removeFile = () => { if (preview) URL.revokeObjectURL(preview); setFile(null); setPreview(''); if (fileRef.current) fileRef.current.value = '' }
  const publish = async (event) => { event.preventDefault(); if (!text.trim() && !file) { setError('Add text or media before publishing.'); return } setLoading(true); setProgress(file ? 0 : null); setError(''); try { const form = new FormData(); form.append('text', text.trim()); if (file) form.append('media', file); const post = await createPost(form, (event) => { if (event.total) setProgress(Math.round((event.loaded / event.total) * 100)) }); setText(''); removeFile(); setProgress(null); onPublished?.(post); push({ tone: 'success', message: 'Post published' }) } catch (requestError) { setProgress(null); setError(getErrorMessage(requestError, 'Post could not be published. Your draft is still here.')) } finally { setLoading(false) } }
  return <form className={`surface rounded-card p-4 sm:p-5 ${expanded ? 'min-h-[360px]' : ''}`} onSubmit={publish}><div className="flex items-start gap-3"><Avatar user={user} size="md" /><div className="min-w-0 flex-1"><TextArea id="post-text" label={expanded ? 'Share something…' : undefined} aria-label="Share something" value={text} onChange={(event) => { setText(event.target.value); setError('') }} placeholder="Share something…" maxLength={5000} className={`${expanded ? 'min-h-40' : 'min-h-24'} border-0 bg-transparent px-0 py-0 shadow-none focus:shadow-none`} /><UploadTray file={file} preview={preview} progress={progress} error={error} onRemove={removeFile} /></div></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--dh-border)] pt-3"><div className="flex items-center gap-1"><Button variant="quiet" type="button" onClick={() => { fileRef.current.accept = 'image/*'; fileRef.current.click() }}><ImagePlus size={17} /> <span className="hidden sm:inline">Add photo</span></Button><Button variant="quiet" type="button" onClick={() => { fileRef.current.accept = 'video/mp4,video/webm,video/quicktime'; fileRef.current.click() }}><Video size={17} /> <span className="hidden sm:inline">Add video</span></Button><input ref={fileRef} type="file" className="sr-only" onChange={chooseFile} /></div><Button type="submit" loading={loading} loadingLabel="Publishing…">Publish</Button></div></form>
}
