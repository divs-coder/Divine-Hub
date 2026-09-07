import { useState } from 'react'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'

export default function DangerZone({ username, onDelete, onLogout }) {
  const [confirming, setConfirming] = useState(false)
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (event) => { event.preventDefault(); if (value !== username) return; setLoading(true); try { await onDelete(value) } finally { setLoading(false) } }
  return <div className="max-w-xl space-y-5"><div className="rounded-card border border-[color-mix(in_srgb,var(--dh-liked)_42%,var(--dh-border))] bg-[color-mix(in_srgb,var(--dh-liked)_5%,transparent)] p-4"><h3 className="font-semibold text-[var(--dh-liked)]">Delete account</h3><p className="mt-2 text-sm leading-6 text-[var(--dh-muted)]">Your profile, posts, comments, messages, and saved posts will be permanently deleted.</p>{!confirming ? <Button variant="danger" className="mt-4" onClick={() => setConfirming(true)}>Delete my account</Button> : <form className="mt-4 space-y-3" onSubmit={submit}><Input id="delete-confirmation" label={`Type ${username} to confirm`} value={value} onChange={(event) => setValue(event.target.value)} /><div className="flex gap-2"><Button variant="secondary" type="button" onClick={() => { setConfirming(false); setValue('') }}>Cancel</Button><Button variant="danger" type="submit" disabled={value !== username} loading={loading} loadingLabel="Deleting…">Confirm delete</Button></div></form>}</div><Button variant="danger" onClick={onLogout}>Log out</Button></div>
}
