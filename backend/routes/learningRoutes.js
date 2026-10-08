const express = require('express')
const { getLearningPath } = require('../controllers/learningController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/path', protect, getLearningPath)

module.exports = router
