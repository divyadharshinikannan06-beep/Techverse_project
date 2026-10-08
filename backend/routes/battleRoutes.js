const express = require('express')
const {
  listBattles,
  getBattle,
  startBattle,
  answerBattleQuestion,
  finishBattle,
  getBattleHistory,
  getArenaStats,
} = require('../controllers/battleController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protect, listBattles)
router.get('/history', protect, getBattleHistory)
router.get('/stats', protect, getArenaStats)
router.get('/:battleId', protect, getBattle)
router.post('/start', protect, startBattle)
router.post('/answer', protect, answerBattleQuestion)
router.post('/finish', protect, finishBattle)

module.exports = router
