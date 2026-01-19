/**
 * Custom error classes for consistent error handling.
 */

export class ValidationError extends Error {
  status = 400
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  status = 404
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  status = 401
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class InternalServerError extends Error {
  status = 500
  constructor(message: string) {
    super(message)
    this.name = 'InternalServerError'
  }
}
