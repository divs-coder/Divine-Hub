export function getErrorMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || error?.message || fallback
}

export function getFieldErrors(error) {
  return error?.response?.data?.fieldErrors || {}
}
