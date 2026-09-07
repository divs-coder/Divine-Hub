import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getErrorMessage, getFieldErrors } from '../../utils/errors.js'
import { validateAuth } from '../../utils/validation.js'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ identifier: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(location.state?.message || '')
  const [loading, setLoading] = useState(false)

  const update = (field, value) => setValues((current) => ({ ...current, [field]: value }))
  const submit = async (event) => {
    event.preventDefault()
    const localErrors = validateAuth(values)
    setErrors(localErrors)
    setServerError('')
    if (Object.keys(localErrors).length) return
    setLoading(true)
    try {
      await login(values)
      navigate(location.state?.from || '/', { replace: true })
    } catch (error) {
      setServerError(getErrorMessage(error, 'Unable to log in right now.'))
      setErrors(getFieldErrors(error))
    } finally { setLoading(false) }
  }

  return <AuthLayout eyebrow="Welcome back" title="Log in to DivineHub" description="Pick up where you left off with the people and conversations that matter." footer="New to DivineHub?" footerLink="/register" footerLabel="Create an account"><form className="space-y-5" onSubmit={submit} noValidate>
    {serverError && <div className="rounded-control border border-[color-mix(in_srgb,var(--dh-liked)_40%,transparent)] bg-[color-mix(in_srgb,var(--dh-liked)_10%,transparent)] px-3 py-2.5 text-sm text-[var(--dh-liked)]" role="alert">{serverError}</div>}
    <Input id="identifier" label="Email or username" value={values.identifier} onChange={(event) => update('identifier', event.target.value)} error={errors.identifier} autoComplete="username" required />
    <div className="space-y-2"><Input id="password" label="Password" type="password" value={values.password} onChange={(event) => update('password', event.target.value)} error={errors.password} autoComplete="current-password" required /><div className="text-right"><Link className="text-xs font-semibold text-[var(--dh-primary)] hover:underline" to="/register">Need an account?</Link></div></div>
    <Button type="submit" className="w-full" loading={loading} loadingLabel="Logging in…">Log in</Button>
  </form></AuthLayout>
}
