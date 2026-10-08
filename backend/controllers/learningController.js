const mongoose = require('mongoose')
const { getProgressState } = require('../services/progressService')

async function getLearningPath(request, response) {
  if (mongoose.connection.readyState !== 1) {
    response.status(503).json({ status: 'error', message: 'Learning data is temporarily unavailable' })
    return
  }

  try {
    const progress = await getProgressState(request.user._id)
    if (!progress) {
      response.status(404).json({ status: 'error', message: 'Complete your assessment to reveal your learning path' })
      return
    }

    response.status(200).json({ status: 'success', learningPath: progress.learningPath })
  } catch (error) {
    response.status(500).json({ status: 'error', message: 'Unable to load your learning path right now' })
  }
}

module.exports = { getLearningPath }
