const express = require('express')
const { getBadges } = require('../controllers/badgeController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protect, getBadges)

module.exports = router
