import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ExternalLink,
  Newspaper,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react'
import Tilt from 'react-parallax-tilt'
import { LoadingSkeleton, ErrorState, EmptyState, NeonButton } from '../components/ui'

function formatNewsDate(value) {
  if (!value) return 'Recent Dispatch'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recent Dispatch'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function getArticleCategory(article) {
  const text = `${article.title || ''} ${article.description || ''}`.toLowerCase()
  if (
    text.includes('ai') ||
    text.includes('gpt') ||
    text.includes('llm') ||
    text.includes('model') ||
    text.includes('neural') ||
    text.includes('machine learning')
  ) {
    return { name: '🔮 AI REALM', tone: 'violet', filter: 'ai' }
  }
  if (
    text.includes('cloud') ||
    text.includes('aws') ||
    text.includes('azure') ||
    text.includes('server') ||
    text.includes('kubernetes')
  ) {
    return { name: '☁️ CLOUD CITADEL', tone: 'cyan', filter: 'cloud' }
  }
  if (
    text.includes('security') ||
    text.includes('hack') ||
    text.includes('breach') ||
    text.includes('vulnerability') ||
    text.includes('auth')
  ) {
    return { name: '🛡️ CYBER AEGIS', tone: 'electric', filter: 'cyber' }
  }
  if (
    text.includes('data') ||
    text.includes('database') ||
    text.includes('sql') ||
    text.includes('analytics') ||
    text.includes('python')
  ) {
    return { name: '💎 DATA REALM', tone: 'mint', filter: 'data' }
  }
  if (
    text.includes('web') ||
    text.includes('browser') ||
    text.includes('css') ||
    text.includes('react') ||
    text.includes('javascript') ||
    text.includes('code')
  ) {
    return { name: '🌐 WEB SPIRE', tone: 'blue', filter: 'web' }
  }
  return { name: '⚡ TECH DISPATCH', tone: 'gold', filter: 'general' }
}

const CATEGORIES = [
  { id: 'all', label: 'All Dispatches' },
  { id: 'ai', label: 'Artificial Intelligence' },
  { id: 'web', label: 'Web Development' },
  { id: 'cloud', label: 'Cloud & Infrastructure' },
  { id: 'cyber', label: 'Cybersecurity' },
  { id: 'data', label: 'Data Science' },
]

export default function TechNewsPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    fetch('/api/news')
      .then(async (response) => {
        const data = await response.json().catch(() => null)
        if (!response.ok || data?.success !== true || !Array.isArray(data.articles)) {
          throw new Error(data?.message || 'Tech news is temporarily unavailable. Please reconnect.')
        }
        if (active) setArticles(data.articles)
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to receive kingdom transmissions')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [attempt])

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const cat = getArticleCategory(article)
      const matchesCategory =
        selectedCategory === 'all' || cat.filter === selectedCategory

      const matchesSearch =
        searchQuery.trim() === '' ||
        article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.source?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [articles, selectedCategory, searchQuery])

  return (
    <main className="crystal-settings-page">
      <div className="tv-cosmic-bg" aria-hidden="true">
        <div className="tv-cosmic-stars" />
      </div>

      <div className="settings-shell" style={{ maxWidth: '1240px' }}>
        {/* Header */}
        <header className="crystal-settings-header">
          <div className="settings-header-crest">
            <Newspaper size={26} className="crest-spark" />
          </div>
          <div>
            <p className="crystal-eyebrow">
              <span className="spark">✦</span> THE TECH CHRONICLES <span className="spark">✦</span>
            </p>
            <h1 className="crystal-title">
              REALM <span className="highlight">TECH NEWS</span>
            </h1>
            <p className="crystal-subtitle">
              Live transmissions, breakthroughs, and technology developments from across the engineering realms.
            </p>
          </div>
        </header>

        {/* Filter & Search Bar */}
        <div className="coding-filter-bar crystal-panel">
          <div className="coding-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search tech dispatches, sources, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="coding-search-input"
            />
          </div>

          <div className="coding-domain-chips">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`crystal-chip ${selectedCategory === cat.id ? 'cyan active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="crystal-state-box" role="status">
            <div className="crystal-loading-spinner" />
            <h3 className="crystal-state-title">RECEIVING TRANSMISSIONS...</h3>
            <p className="crystal-state-desc">Connecting to real-time engineering feeds.</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorState
            title="TRANSMISSIONS OFFLINE"
            message={error}
            onRetry={() => setAttempt((a) => a + 1)}
          />
        )}

        {/* Empty State */}
        {!loading && !error && filteredArticles.length === 0 && (
          <EmptyState
            icon={Newspaper}
            title="NO TRANSMISSIONS FOUND"
            description="No articles matched your filter criteria. Try resetting your search."
            actionLabel="Reset Search"
            onAction={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
          />
        )}

        {/* Articles Grid */}
        {!loading && !error && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredArticles.map((article, idx) => {
              const cat = getArticleCategory(article)
              return (
                <Tilt
                  key={article.url || idx}
                  tiltMaxAngleX={6}
                  tiltMaxAngleY={6}
                  scale={1.01}
                  transitionSpeed={300}
                  glareEnable={false}
                  className="tv-news-tilt-wrap"
                >
                  <article className="tv-news-article" style={{ height: '100%' }}>
                    {article.imageUrl ? (
                      <img className="tv-news-image" src={article.imageUrl} alt="" loading="lazy" />
                    ) : (
                      <span className="tv-news-image tv-news-image-empty">
                        <Newspaper size={28} />
                      </span>
                    )}

                    <div className="tv-news-article-copy">
                      <div className="tv-news-meta">
                        <span className={`news-cat-chip cat-${cat.tone}`}>{cat.name}</span>
                        <time dateTime={article.publishedAt || undefined}>
                          {formatNewsDate(article.publishedAt)}
                        </time>
                      </div>

                      <h4>{article.title}</h4>
                      <p>{article.description || 'Open the story to explore the full technical dispatch.'}</p>

                      <div className="tv-news-footer">
                        <span className="tv-news-source">{article.source || 'Tech Dispatch'}</span>
                        <a
                          className="tv-news-read-more"
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span>Read Story</span>
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </article>
                </Tilt>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
