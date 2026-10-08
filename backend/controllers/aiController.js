const { buildAdaptiveProfile } = require('../services/adaptiveLearningService')
const { generateTechVerseReply, hasGeminiApiKey } = require('../services/aiService')
const { withinRateLimit } = require('./adaptiveController')

const MAX_MESSAGE_LENGTH = 2000
const MAX_HISTORY_MESSAGES = 10
const UNAVAILABLE_MESSAGE = 'AI Assistant is temporarily unavailable. Please try again in a moment.'

function normalizeHistory(history) {
  if (history === undefined) return []
  if (!Array.isArray(history)) return null
  return history.slice(-MAX_HISTORY_MESSAGES).filter((item) => (
    item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string'
  ))
}

async function chatWithAI(request, response) {
  const message = request.body?.message
  if (typeof message !== 'string' || !message.trim()) {
    response.status(400).json({ success: false, message: 'Enter a message for the AI Assistant.', reply: 'Please provide a question or topic to explore.' })
    return
  }
  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    response.status(413).json({ success: false, message: 'Keep your message under 2,000 characters.', reply: 'Your message exceeds the 2,000 character limit.' })
    return
  }

  const history = normalizeHistory(request.body?.history)
  if (!history) {
    response.status(400).json({ success: false, message: 'Conversation history is invalid.', reply: 'Invalid conversation history.' })
    return
  }
  if (!hasGeminiApiKey()) {
    response.status(503).json({ success: false, message: UNAVAILABLE_MESSAGE, reply: UNAVAILABLE_MESSAGE })
    return
  }

  const rateIdentifier = request.user?._id || request.ip || 'guest-session'
  if (!withinRateLimit(rateIdentifier)) {
    response.status(429).json({ success: false, message: 'Please wait a moment before sending another question.', reply: 'Please wait a moment before sending another question.' })
    return
  }

  let profile = null
  if (request.user?._id) {
    try {
      profile = await buildAdaptiveProfile(request.user._id)
    } catch (profileError) {
      console.warn('AI Lab adaptive profile warning:', profileError.message)
    }
  }

  try {
    const reply = await generateTechVerseReply({ message: message.trim(), history, profile })
    response.status(200).json({ success: true, reply })
  } catch (error) {
    console.error('AI Lab request failed:', error.code || error.message || 'AI_SERVER_ERROR')
    const status = error.code === 'AI_PROVIDER_TIMEOUT' ? 504 : error.code === 'AI_INVALID_RESPONSE' || error.code === 'AI_PROVIDER_ERROR' ? 502 : 503
    response.status(status).json({
      success: false,
      message: UNAVAILABLE_MESSAGE,
      reply: 'The AI Wizard Tower is temporarily recharging its crystals. Please try asking your question again in a moment.',
    })
  }
}

module.exports = { chatWithAI }