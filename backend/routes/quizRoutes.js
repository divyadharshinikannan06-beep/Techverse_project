const express = require('express')
const { submitQuiz } = require('../controllers/quizController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/submit', protect, submitQuiz)

module.exports = router
