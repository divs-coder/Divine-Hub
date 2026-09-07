import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button.jsx'

export default function MessageComposer({ onSend, onTyping, disabled = false }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const typingTimeout = useRef(null)
  const emitTyping = (value) => { setText(value); onTyping?.(Boolean(value.trim())); window.clearTimeout(typingTimeout.current); if (value.trim()) typingTimeout.current = window.setTimeout(() => onTyping?.(false), 1000) }
  useEffect(() => () => { window.clearTimeout(typingTimeout.current); onTyping?.(false) }, [onTyping])
  const submit = async (event) => { event.preventDefault(); if (!text.trim() || disabled || loading) return; setLoading(true); try { await onSend(text.trim()); setText(''); onTyping?.(false) } finally { setLoading(false) } }
  return <form className="flex items-end gap-2 border-t border-[var(--dh-border)] bg-[var(--dh-courtyard)] p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] sm:p-4" onSubmit={submit}><label className="sr-only" htmlFor="message-input">Write a message</label><textarea id="message-input" className="field max-h-32 min-h-11 flex-1 resize-none py-2.5" rows="1" placeholder="Write a message" value={text} onChange={(event) => emitTyping(event.target.value)} onBlur={() => onTyping?.(false)} disabled={disabled} /><Button type="submit" className="shrink-0" loading={loading} loadingLabel="Sending…"><Send size={16} /> <span className="hidden sm:inline">Send</span></Button></form>
}
