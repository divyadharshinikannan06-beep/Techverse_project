const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (request, response, next) => {
  try {
    let token

    const authHeader = request.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }

    if (!token) {
      response.status(401).json({
        status: 'error',
        message: 'Not authorized, token missing',
      })
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      response.status(401).json({
        status: 'error',
        message: 'User not found',
      })
      return
    }

    request.user = user
    next()
  } catch (error) {
    response.status(401).json({
      status: 'error',
      message: 'Session expired or token invalid',
    })
  }
}

module.exports = { protect }
