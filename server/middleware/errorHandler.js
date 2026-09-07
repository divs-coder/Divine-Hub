import multer from 'multer'

export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  error.statusCode = 404
  error.code = 'NOT_FOUND'
  next(error)
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500
  let message = error.message || 'Something went wrong'
  let code = error.code || 'SERVER_ERROR'
  let fieldErrors = error.fieldErrors

  if (error.code === 11000) {
    statusCode = 409
    const duplicateField = Object.keys(error.keyPattern || error.keyValue || {})[0]
    message = duplicateField === 'email' ? 'Email already exists' : duplicateField === 'username' ? 'Username already exists' : 'A record already exists'
    code = duplicateField ? `${duplicateField.toUpperCase()}_EXISTS` : 'DUPLICATE_RECORD'
    fieldErrors = duplicateField ? { [duplicateField]: message } : undefined
  } else if (error.name === 'ValidationError') {
    statusCode = 400
    message = 'Please check the highlighted fields'
    code = 'VALIDATION_ERROR'
    fieldErrors = Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message]))
   } else if (error instanceof multer.MulterError) {
     statusCode = 400
     code = 'UPLOAD_ERROR'
     message = error.code === 'LIMIT_FILE_SIZE' ? 'Image or video is too large.' : 'Upload could not be processed'
   } else if (error.name === 'CastError') {
     statusCode = 400
     code = 'INVALID_ID'
     message = `Invalid ${error.path || 'identifier'}`
   }

  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error(error)
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(fieldErrors ? { fieldErrors } : {}),
  })
}
