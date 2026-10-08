const { getTechNews } = require('../services/newsService')

async function getNews(_request, response) {
  try {
    const articles = await getTechNews()
    response.status(200).json({ success: true, articles })
  } catch (error) {
    const isTimeout = error.code === 'NEWS_TIMEOUT'
    const isConfigurationError = error.code === 'NEWS_CONFIG_ERROR'
    response.status(isTimeout ? 504 : isConfigurationError ? 500 : 502).json({
      success: false,
      message: 'Tech news is temporarily unavailable. Please try again.',
      code: error.code || 'NEWS_PROVIDER_ERROR',
    })
  }
}

module.exports = { getNews }