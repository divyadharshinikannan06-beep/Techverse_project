const express = require('express')
const { getAdaptiveProfile, askAdaptiveAssistant } = require('../controllers/adaptiveController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/profile', protect, getAdaptiveProfile)
router.post('/ask', protect, askAdaptiveAssistant)

module.exports = router
