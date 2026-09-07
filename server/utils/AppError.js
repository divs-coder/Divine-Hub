export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'SERVER_ERROR', fieldErrors = undefined) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.fieldErrors = fieldErrors
    this.isOperational = true
  }
}
