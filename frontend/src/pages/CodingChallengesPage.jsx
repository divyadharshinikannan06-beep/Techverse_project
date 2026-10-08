import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  ChevronRight,
  Code2,
  Compass,
  Filter,
  LockKeyhole,
  Search,
  Sparkles,
  Swords,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CrystalBadge, NeonButton } from '../components/ui'

const DOMAINS = [
  'All Realms',
  'Artificial Intelligence',
  'Web Development',
  'Cloud Computing',
  'Cybersecurity',
  'Data Science',
]

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced']

export default function CodingChallengesPage() {
  const { token } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('All Realms')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')

  useEffect(() => {
    let active = true
    fetch('/api/coding/challenges', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load coding challenges')
        if (active) setChallenges(data.challenges || [])
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Coding challenges are unavailable right now')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [token])

  // Filter challenges
  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.domain?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchDomain =
        selectedDomain === 'All Realms' ||
        c.domain?.toLowerCase().includes(selectedDomain.toLowerCase())

      const matchDifficulty =
        selectedDifficulty === 'All' ||
        c.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase()

      return matchSearch && matchDomain && matchDifficulty
    })
  }, [challenges, searchQuery, selectedDomain, selectedDifficulty])

  const completedCount = challenges.filter((c) => c.status === 'completed').length

  return (
    <main className="coding-page">
      <div className="tv-cosmic-bg" aria-hidden="true">
        <div className="tv-cosmic-stars" />
      </div>

      <div className="coding-page-shell">
        {/* Header */}
        <header className="coding-page-header">
          <div className="coding-header-crest">
            <Code2 size={28} />
          </div>
          <div>
            <p className="crystal-eyebrow">
              <span className="spark">✦</span> CODING SANCTUM · ALGORITHMIC FORGE <span className="spark">✦</span>
            </p>
            <h1 className="crystal-title">
              PRACTICE <span className="highlight">CODING ARENA</span>
            </h1>
            <p className="crystal-subtitle">
              Solve algorithmic quests across Python and JavaScript to forge high engineering mastery and earn realm XP.
            </p>
          </div>

          {!loading && !error && (
            <div className="arena-stats-pill crystal-panel">
              <Code2 size={16} className="arena-code-icon" />
              <span>
                <strong>{completedCount}</strong> / {challenges.length} Conquered
              </span>
            </div>
          )}
        </header>

        {/* Filter & Search Bar */}
        <div className="coding-filter-bar crystal-panel">
          <div className="coding-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search challenges, domains, or algorithmic tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="coding-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                Clear
              </button>
            )}
          </div>

          <div className="coding-filter-selectors">
            {/* Domain Tabs */}
            <div className="coding-domain-chips">
              {DOMAINS.map((domain) => (
                <button
                  key={domain}
                  type="button"
                  className={`crystal-chip ${selectedDomain === domain ? 'cyan active' : ''}`}
                  onClick={() => setSelectedDomain(domain)}
                >
                  {domain}
                </button>
              ))}
            </div>

            {/* Difficulty Chips */}
            <div className="coding-difficulty-chips">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  className={`crystal-chip small ${selectedDifficulty === diff ? 'gold active' : ''}`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="crystal-state-box" role="status">
            <div className="crystal-loading-spinner" />
            <h3 className="crystal-state-title">ENTERING THE CODING REALM...</h3>
            <p className="crystal-state-desc">Loading algorithmic arena challenges and test runners.</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="crystal-state-box error" role="alert">
            <h3 className="crystal-state-title">ARENA NOTICE</h3>
            <p className="crystal-state-desc">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredChallenges.length === 0 && (
          <div className="crystal-state-box">
            <div className="crystal-state-gem">
              <Compass size={32} />
            </div>
            <h3 className="crystal-state-title">NO MATCHING CHALLENGES</h3>
            <p className="crystal-state-desc">
              Try adjusting your search query or realm filter to find available challenges.
            </p>
            <NeonButton
              variant="secondary"
              onClick={() => {
                setSearchQuery('')
                setSelectedDomain('All Realms')
                setSelectedDifficulty('All')
              }}
            >
              Reset Filters
            </NeonButton>
          </div>
        )}

        {/* Challenges Grid */}
        <div className="coding-challenge-list">
          {filteredChallenges.map((challenge, index) => {
            const locked = challenge.status === 'locked'
            const completed = challenge.status === 'completed'

            return (
              <motion.article
                className={`crystal-panel coding-challenge-card ${challenge.status}`}
                key={challenge.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: Math.min(index * 0.03, 0.25), type: 'spring' }}
                whileHover={!locked && !completed ? { y: -4, scale: 1.01 } : undefined}
              >
                <div
                  className={`challenge-card-icon ${
                    locked ? 'locked' : completed ? 'completed' : 'unlocked'
                  }`}
                >
                  {locked ? (
                    <LockKeyhole size={20} />
                  ) : completed ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <Code2 size={20} />
                  )}
                </div>

                <div className="challenge-card-main">
                  <div className="challenge-card-tags">
                    <span className="crystal-chip cyan small">{challenge.domain}</span>
                    <span className={`crystal-chip small ${challenge.difficulty.toLowerCase()}`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <h2>{challenge.title}</h2>
                  <p>
                    {challenge.requiredModuleTitle || challenge.moduleId.replaceAll('-', ' ')} · Challenge {challenge.order}
                  </p>
                </div>

                <div className="challenge-card-reward">
                  <Zap size={16} />
                  <span>{completed ? `${challenge.xpEarned} XP Earned` : `+${challenge.xp} XP`}</span>
                </div>

                <div className="challenge-card-action">
                  {completed ? (
                    <span className="crystal-chip emerald">
                      <CheckCircle2 size={14} /> Completed
                    </span>
                  ) : locked ? (
                    <span className="crystal-chip small locked" title={challenge.lockedReason}>
                      <LockKeyhole size={13} /> Sealed
                    </span>
                  ) : (
                    <Link className="crystal-btn crystal-btn-primary small" to={`/coding/${challenge.id}`}>
                      {challenge.attempted ? 'Retry Quest' : 'Enter Arena'} <ChevronRight size={14} />
                    </Link>
                  )}
                </div>

                {locked && <small className="challenge-lock-reason">{challenge.lockedReason}</small>}
              </motion.article>
            )
          })}
        </div>
      </div>
    </main>
  )
}
