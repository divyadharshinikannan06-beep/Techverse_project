const mongoose = require('mongoose')
const { getStreak } = require('../services/streakService')

async function getMyStreak(request, response) {
  if (mongoose.connection.readyState !== 1) {
    response.status(503).json({ status: 'error', message: 'Streak records are temporarily unavailable' })
    return
  }
  try {
    const streak = await getStreak(request.user._id)
    response.status(200).json({ status: 'success', streak })
  } catch (error) {
    response.status(500).json({ status: 'error', message: 'Unable to load streak right now' })
  }
}

module.exports = { getMyStreak }
