const Parser = require('rss-parser')

const DEFAULT_FEED_URL = 'https://feeds.arstechnica.com/arstechnica/technology-lab'
const FEED_TIMEOUT_MS = 8000
const parser = new Parser({
  customFields: {
    item: [['media:content', 'mediaContent'], ['media:thumbnail', 'mediaThumbnail']],
  },
})

function safeUrl(value) {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

function getImageUrl(item) {
  const media = [item.mediaContent, item.mediaThumbnail].flat().find(Boolean)
  return safeUrl(item.enclosure?.url || media?.$?.url || media?.url)
}

function getPublishedAt(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function toArticle(item, source) {
  const title = typeof item.title === 'string' ? item.title.trim() : ''
  const url = safeUrl(item.link)
  if (!title || !url) return null

  const description = String(item['content:encodedSnippet'] || item.contentSnippet || item.summary || item.description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return {
    title,
    description: description.slice(0, 320),
    url,
    imageUrl: getImageUrl(item),
    source,
    publishedAt: getPublishedAt(item.isoDate || item.pubDate),
  }
}

async function getTechNews() {
  const feedUrl = safeUrl(process.env.TECH_NEWS_FEED_URL || DEFAULT_FEED_URL)
  if (!feedUrl) {
    const error = new Error('The configured tech news feed URL is invalid.')
    error.code = 'NEWS_CONFIG_ERROR'
    throw error
  }

  let response
  try {
    response = await fetch(feedUrl, {
      headers: {
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
        'User-Agent': 'TechVerse News Reader/1.0',
      },
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    })
  } catch (cause) {
    const isTimeout = cause.name === 'TimeoutError' || cause.name === 'AbortError'
    const error = new Error(isTimeout ? 'The tech news provider timed out.' : 'Unable to reach the tech news provider.')
    error.code = isTimeout ? 'NEWS_TIMEOUT' : 'NEWS_PROVIDER_ERROR'
    throw error
  }

  if (!response.ok) {
    const error = new Error(`The tech news provider returned HTTP ${response.status}.`)
    error.code = 'NEWS_PROVIDER_ERROR'
    throw error
  }

  let feed
  try {
    feed = await parser.parseString(await response.text())
  } catch {
    const error = new Error('The tech news provider returned an invalid feed.')
    error.code = 'NEWS_INVALID_RESPONSE'
    throw error
  }

  if (typeof feed.title !== 'string' || !Array.isArray(feed.items)) {
    const error = new Error('The tech news provider returned an invalid feed.')
    error.code = 'NEWS_INVALID_RESPONSE'
    throw error
  }

  const articles = feed.items.map((item) => toArticle(item, feed.title.trim() || 'Tech News')).filter(Boolean).slice(0, 20)
  if (feed.items.length && !articles.length) {
    const error = new Error('The tech news provider returned no valid articles.')
    error.code = 'NEWS_INVALID_RESPONSE'
    throw error
  }

  return articles
}

module.exports = { getTechNews }