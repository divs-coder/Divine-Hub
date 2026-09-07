import { useState } from 'react'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'

export default function PasswordChangeForm({ onSave }) {
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }))
  const submit = async (event) => { event.preventDefault(); setError(''); setMessage(''); if (values.newPassword.length < 8) { setError('New password must be at least 8 characters.'); return } if (values.newPassword !== values.confirmPassword) { setError('Passwords do not match.'); return } setLoading(true); try { await onSave(values); setValues({ currentPassword: '', newPassword: '', confirmPassword: '' }); setMessage('Password changed') } catch (requestError) { setError(requestError?.response?.data?.message || 'Unable to change password.') } finally { setLoading(false) } }
  return <form className="max-w-xl space-y-4" onSubmit={submit}>{error && <p className="text-sm text-[var(--dh-liked)]" role="alert">{error}</p>}{message && <p className="text-sm text-[var(--dh-presence)]" role="status">{message}</p>}<Input id="currentPassword" label="Current password" type="password" value={values.currentPassword} onChange={(event) => update('currentPassword', event.target.value)} required /><Input id="newPassword" label="New password" type="password" value={values.newPassword} onChange={(event) => update('newPassword', event.target.value)} required /><Input id="confirmNewPassword" label="Confirm new password" type="password" value={values.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} required /><Button type="submit" loading={loading} loadingLabel="Saving…">Change password</Button></form>
}
