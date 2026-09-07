import { useEffect, useRef, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import TextArea from '../ui/TextArea.jsx'
import Button from '../ui/Button.jsx'
import Avatar from '../ui/Avatar.jsx'
import { getErrorMessage, getFieldErrors } from '../../utils/errors.js'

export default function ProfileEditForm({ open, onClose, user, onSave }) {
  const [values, setValues] = useState({ fullName: '', username: '', phoneNumber: '', bio: '' })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)
  useEffect(() => { if (open && user) { setValues({ fullName: user.fullName || '', username: user.username || '', phoneNumber: user.phoneNumber || '', bio: user.bio || '' }); setPreview(user.profilePicture || ''); setErrors({}); setServerError('') } }, [open, user])
  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview) }, [preview])
  const update = (field, value) => setValues((current) => ({ ...current, [field]: value }))
  const chooseFile = (event) => { const next = event.target.files?.[0]; if (!next) return; if (!next.type.startsWith('image/')) { setErrors({ profilePicture: 'Choose an image file.' }); return } setFile(next); setPreview(URL.createObjectURL(next)) }
  const submit = async (event) => { event.preventDefault(); setLoading(true); setServerError(''); try { const form = new FormData(); Object.entries(values).forEach(([key, value]) => form.append(key, value)); if (file) form.append('profilePicture', file); await onSave(form); onClose() } catch (error) { setServerError(getErrorMessage(error)); setErrors(getFieldErrors(error)) } finally { setLoading(false) } }
  return <Modal open={open} onClose={onClose} title="Edit profile" size="md"><form className="space-y-4" onSubmit={submit}>{serverError && <p className="text-sm text-[var(--dh-liked)]" role="alert">{serverError}</p>}<div className="flex items-center gap-4"><Avatar user={{ ...user, profilePicture: preview || user?.profilePicture }} size="lg" /><div><Button variant="secondary" type="button" onClick={() => fileRef.current?.click()}>Change picture</Button><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={chooseFile} /><p className="mt-2 text-xs text-[var(--dh-muted)]">JPG, PNG, or WebP.</p>{errors.profilePicture && <p className="text-xs text-[var(--dh-liked)]">{errors.profilePicture}</p>}</div></div><Input id="edit-fullName" label="Full name" value={values.fullName} onChange={(event) => update('fullName', event.target.value)} error={errors.fullName} required /><Input id="edit-username" label="Username" value={values.username} onChange={(event) => update('username', event.target.value)} error={errors.username} required /><Input id="edit-phoneNumber" label="Phone number" type="tel" value={values.phoneNumber} onChange={(event) => update('phoneNumber', event.target.value)} error={errors.phoneNumber} required /><TextArea id="edit-bio" label="Bio" maxLength={280} value={values.bio} onChange={(event) => update('bio', event.target.value)} error={errors.bio} /><div className="flex justify-end gap-2 pt-2"><Button variant="secondary" type="button" onClick={onClose} disabled={loading}>Cancel</Button><Button type="submit" loading={loading} loadingLabel="Saving…">Save changes</Button></div></form></Modal>
}
