const express = require('express')
const { registerUser, loginUser, getCurrentUser } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', (_request, response) => {
  response.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  })
})
router.get('/me', protect, getCurrentUser)

module.exports = router
