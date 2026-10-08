const express = require('express')
const { getCodingChallenges, getCodingChallenge, runSubmission, submitCodingChallenge } = require('../controllers/codingController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/challenges', protect, getCodingChallenges)
router.post('/run', protect, runSubmission)
router.post('/submit', protect, submitCodingChallenge)
router.get('/:challengeId', protect, getCodingChallenge)

module.exports = router
