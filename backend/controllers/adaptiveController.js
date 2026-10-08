const mongoose = require('mongoose')
const { buildAdaptiveProfile } = require('../services/adaptiveLearningService')
const { answerLearningQuestion } = require('../services/aiService')

const requestWindowMs = 60 * 1000
const maxRequestsPerWindow = 10
const requestLog = new Map()

function databaseReady(response) {
  if (mongoose.connection.readyState === 1) return true
  response.status(503).json({ status: 'error', message: 'Adaptive learning is temporarily unavailable' })
  return false
}

function withinRateLimit(userId) {
  const now = Date.now()
  const existing = requestLog.get(String(userId)) || []
  const recent = existing.filter((timestamp) => now - timestamp < requestWindowMs)
  if (recent.length >= maxRequestsPerWindow) {
    requestLog.set(String(userId), recent)
    return false
  }
  recent.push(now)
  requestLog.set(String(userId), recent)
  return true
}

async function getAdaptiveProfile(request, response) {
  if (!databaseReady(response)) return
  try {
    const profile = await buildAdaptiveProfile(request.user._id)
    response.status(200).json({ status: 'success', profile })
  } catch (error) {
    response.status(500).json({ status: 'error', message: 'Unable to analyze your learning path right now' })
  }
}

async function askAdaptiveAssistant(request, response) {
  if (!databaseReady(response)) return
  if (!withinRateLimit(request.user._id)) {
    response.status(429).json({ status: 'error', message: 'The Tech Oracle needs a moment before another question' })
    return
  }
  const message = request.body?.message
  if (typeof message !== 'string' || !message.trim()) {
    response.status(400).json({ status: 'error', message: 'Ask a learning question first' })
    return
  }
  if (message.trim().length > 1000) {
    response.status(413).json({ status: 'error', message: 'Keep your question under 1,000 characters' })
    return
  }

  try {
    const profile = await buildAdaptiveProfile(request.user._id)
    const answer = await answerLearningQuestion(profile, message.trim())
    response.status(200).json({ status: 'success', ...answer })
  } catch (error) {
    response.status(200).json({ status: 'success', source: 'adaptive-engine', answer: 'Keep working through your next unlocked mission. The deterministic learning guide is available even when the external oracle is offline.' })
  }
}

module.exports = { getAdaptiveProfile, askAdaptiveAssistant, withinRateLimit }
