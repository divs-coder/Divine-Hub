import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader.jsx'
import PostComposer from '../../components/posts/PostComposer.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function CreatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  return <><PageHeader eyebrow="Create" title="Share something" description="Choose your words, add a photo or a short video, and publish when it feels ready." /><div className="mx-auto max-w-2xl px-5 py-6 sm:px-8"><PostComposer user={user} expanded onPublished={() => navigate('/')} /></div></>
}
