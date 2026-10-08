const express = require('express')
const { getMyProgress, startModule, completeModule } = require('../controllers/progressController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/me', protect, getMyProgress)
router.post('/start', protect, startModule)
router.post('/complete', protect, completeModule)

module.exports = router
