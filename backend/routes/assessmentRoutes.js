const express = require('express')
const { submitAssessment, getMyAssessment } = require('../controllers/assessmentController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/submit', protect, submitAssessment)
router.get('/me', protect, getMyAssessment)

module.exports = router
