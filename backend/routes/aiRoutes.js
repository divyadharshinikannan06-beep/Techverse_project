const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { chatWithAI } = require('../controllers/aiController')

const router = express.Router()

// Optional authentication: if Bearer token is supplied, attach student user context.
// If token is absent or invalid, still allows guest queries so testing and public access work gracefully.
const optionalProtect = async (request, _response, next) => {
  try {
    const authHeader = request.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      if (token && process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId).select('-password')
        if (user) {
          request.user = user
        }
      }
    }
  } catch {
    // Proceed as guest
  }
  next()
}

router.post('/chat', optionalProtect, chatWithAI)

module.exports = router