const notFound = (request, _response, next) => {
  const error = new Error(`Route not found: ${request.originalUrl}`)
  error.statusCode = 404
  next(error)
}

const errorHandler = (error, _request, response, _next) => {
  const statusCode = error.statusCode || 500
  const responseBody = {
    status: 'error',
    message: error.message || 'Internal server error',
  }

  if (process.env.NODE_ENV === 'development') {
    responseBody.stack = error.stack
  }

  response.status(statusCode).json(responseBody)
}

module.exports = {
  notFound,
  errorHandler,
}
