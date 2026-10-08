const mongoose = require('mongoose')
const { getBadgeOverview } = require('../services/badgeService')

async function getBadges(request, response) {
  if (mongoose.connection.readyState !== 1) {
    response.status(503).json({ status: 'error', message: 'Badge records are temporarily unavailable' })
    return
  }
  try {
    const overview = await getBadgeOverview(request.user._id)
    response.status(200).json({ status: 'success', ...overview })
  } catch (error) {
    response.status(500).json({ status: 'error', message: 'Unable to load badges right now' })
  }
}

module.exports = { getBadges }
