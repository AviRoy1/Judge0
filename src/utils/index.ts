class ApiError extends Error {
    statusCode
    isOperational
  
    constructor(statusCode:any, message:any, isOperational = true, stack = '') {
      super(message)
      this.statusCode = statusCode
      this.isOperational = isOperational
      if (stack) {
        this.stack = stack
      } else {
        Error.captureStackTrace(this, this.constructor)
      }
    }
  }
  
  export default ApiError