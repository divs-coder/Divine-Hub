import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getErrorMessage, getFieldErrors } from '../../utils/errors.js'
import { validateAuth } from '../../utils/validation.js'

const initialValues = { fullName: '', username: '', email: '', phoneNumber: '', password: '', confirmPassword: '' }

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const update = (field, value) => setValues((current) => ({ ...current, [field]: value }))
  const submit = async (event) => {
    event.preventDefault()
    const localErrors = validateAuth(values, 'register')
    setErrors(localErrors)
    setServerError('')
    if (Object.keys(localErrors).length) return
    setLoading(true)
    try { await register(values); navigate('/', { replace: true }) } catch (error) { setServerError(getErrorMessage(error, 'Unable to create your account right now.')); setErrors(getFieldErrors(error)) } finally { setLoading(false) }
  }
  return <AuthLayout eyebrow="Make yourself at home" title="Create your account" description="Join a calmer social space for sharing, conversations, and real connection." footer="Already have an account?" footerLink="/login" footerLabel="Log in"><form className="space-y-4" onSubmit={submit} noValidate>
    {serverError && <div className="rounded-control border border-[color-mix(in_srgb,var(--dh-liked)_40%,transparent)] bg-[color-mix(in_srgb,var(--dh-liked)_10%,transparent)] px-3 py-2.5 text-sm text-[var(--dh-liked)]" role="alert">{serverError}</div>}
    <Input id="fullName" label="Full name" value={values.fullName} onChange={(event) => update('fullName', event.target.value)} error={errors.fullName} autoComplete="name" required />
    <Input id="username" label="Username" hint="3–24 lowercase letters, numbers, or underscores" value={values.username} onChange={(event) => update('username', event.target.value)} error={errors.username} autoComplete="username" required />
    <Input id="email" label="Email" type="email" value={values.email} onChange={(event) => update('email', event.target.value)} error={errors.email} autoComplete="email" required />
    <Input id="phoneNumber" label="Phone number" type="tel" value={values.phoneNumber} onChange={(event) => update('phoneNumber', event.target.value)} error={errors.phoneNumber} autoComplete="tel" required />
    <div className="grid gap-4 sm:grid-cols-2"><Input id="password" label="Password" type="password" value={values.password} onChange={(event) => update('password', event.target.value)} error={errors.password} autoComplete="new-password" required /><Input id="confirmPassword" label="Confirm password" type="password" value={values.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} error={errors.confirmPassword} autoComplete="new-password" required /></div>
    <Button type="submit" className="mt-2 w-full" loading={loading} loadingLabel="Creating account…">Create account</Button>
  </form></AuthLayout>
}
