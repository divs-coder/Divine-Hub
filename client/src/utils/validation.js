export function validateAuth(values, mode = 'login') {
  const errors = {}
  if (mode === 'register') {
    if (!values.fullName?.trim()) errors.fullName = 'Full name is required'
    if (!values.username?.trim()) errors.username = 'Username is required'
    if (!values.phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required'
  }
  if (!values.identifier?.trim() && mode === 'login') errors.identifier = 'Email or username is required'
  if (!values.email?.trim() && mode === 'register') errors.email = 'Email is required'
  if (!values.password) errors.password = 'Password is required'
  if (mode === 'register' && values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match'
  return errors
}
