const express = require('express')
const { getMyStreak } = require('../controllers/streakController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protect, getMyStreak)

module.exports = router
