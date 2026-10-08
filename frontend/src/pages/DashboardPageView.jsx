import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import {
  ArrowRight,
  Award,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  CircleHelp,
  Code2,
  Crown,
  ExternalLink,
  Flame,
  Newspaper,
  Sparkles,
  Swords,
  Trophy,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import BadgeUnlockToast from '../components/BadgeUnlockToast'
import CrystalWorld from '../components/CrystalWorld'
import formatLearningTitle from '../utils/formatLearningTitle'
import './DashboardPageTheme.css'

function FeatureCard({ to, icon: Icon, title, description, tone }) {
  return (
    <Tilt
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      scale={1.03}
      transitionSpeed={350}
      glareEnable={true}
      glareMaxOpacity={0.15}
      glareColor="#ffffff"
      glarePosition="all"
      className="tv-feature-tilt-wrap"
    >
      <Link className={`tv-feature-card ${tone}`} to={to}>
        <span className="tv-feature-icon">
          <Icon size={22} strokeWidth={2} />
        </span>
        <span className="tv-feature-copy">
          <strong>{title}</strong>
          <small>{description}</small>
        </span>
        <ArrowRight className="tv-feature-arrow" size={16} />
      </Link>
    </Tilt>
  )
}

function PlayerHeader({ user, progress, badges, streak, rank }) {
  const name = user?.name?.trim() || 'Apprentice'
  const totalXp = progress?.totalXP ?? user?.xp ?? 0
  const levelNum = user?.level || Math.max(1, Math.floor((totalXp / 300) + 1))
  const levelStr = String(levelNum).padStart(2, '0')

  // Calculate XP threshold in current tier (300 XP per level)
  const currentTierBase = (levelNum - 1) * 300
  const xpInLevel = Math.max(0, totalXp - currentTierBase)
  const xpNeeded = 300
  const xpPercentage = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))

  const completed = progress?.completedModuleCount ?? 0
  const totalModules = progress?.totalAccessibleModules ?? 12
  const earnedBadges = badges.filter((badge) => badge.earned).length
  const currentStreak = streak?.currentStreak || 1
  const rankStr = rank?.rank ? `#${rank.rank}` : '#1'

  return (
    <motion.header
      className="rpg-dashboard-hud"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Player Identity Block */}
      <div className="rpg-hud-character">
        <div className="rpg-hud-avatar-wrapper">
          <span className="rpg-hud-avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" />
            ) : (
              name.slice(0, 1).toUpperCase()
            )}
          </span>
          <span className="rpg-avatar-crown-badge">
            <Crown size={11} />
          </span>
        </div>

        <div className="rpg-hud-id-copy">
          <span className="rpg-rank-title">WELCOME TO THE CRYSTAL CITADEL</span>
          <h2 className="rpg-character-name">Hello, {name} 👋</h2>
          <span className="rpg-level-tag">LEVEL {levelStr} · ARCHMAGE CANDIDATE</span>
        </div>
      </div>

      {/* RPG HUD Stat Modules */}
      <div className="rpg-hud-metrics-grid">
        {/* Level & XP Progression Bar */}
        <div className="rpg-metric-card metric-xp-bar">
          <div className="metric-header">
            <span className="metric-label">
              <Crown size={12} className="metric-icon gold" />
              <span>LEVEL {levelStr}</span>
            </span>
            <span className="metric-value-accent">
              {xpInLevel} / {xpNeeded} XP
            </span>
          </div>

          <div className="rpg-xp-track" role="progressbar" aria-valuenow={xpPercentage} aria-valuemin="0" aria-valuemax="100">
            <motion.div
              className="rpg-xp-fill"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <span className="rpg-xp-ratio-text">
            {totalXp.toLocaleString()} Total Realm XP ({xpPercentage}% to Level {String(levelNum + 1).padStart(2, '0')})
          </span>
        </div>

        {/* 🔥 STREAK */}
        <div className="rpg-metric-card metric-streak">
          <span className="metric-label">
            <Flame size={13} className="metric-icon flame" />
            <span>STREAK</span>
          </span>
          <strong className="metric-number flame-glow">{currentStreak} DAYS</strong>
          <span className="metric-sub">Unbroken Flame</span>
        </div>

        {/* 🏆 RANK */}
        <div className="rpg-metric-card metric-rank">
          <span className="metric-label">
            <Trophy size={13} className="metric-icon gold" />
            <span>RANK</span>
          </span>
          <strong className="metric-number gold-glow">{rankStr}</strong>
          <span className="metric-sub">Leaderboard</span>
        </div>

        {/* 💎 TOTAL XP */}
        <div className="rpg-metric-card metric-crystals">
          <span className="metric-label">
            <Sparkles size={13} className="metric-icon cyan" />
            <span>CRYSTAL XP</span>
          </span>
          <strong className="metric-number cyan-glow">{totalXp.toLocaleString()}</strong>
          <span className="metric-sub">Kingdom Power</span>
        </div>

        {/* 🛡️ BADGES */}
        <div className="rpg-metric-card metric-badges">
          <span className="metric-label">
            <Award size={13} className="metric-icon violet" />
            <span>BADGES</span>
          </span>
          <strong className="metric-number violet-glow">
            {earnedBadges} <small>/ {badges.length || 8}</small>
          </strong>
          <span className="metric-sub">Royal Relics</span>
        </div>

        {/* 🏰 MODULES CONQUERED */}
        <div className="rpg-metric-card metric-spires">
          <span className="metric-label">
            <BookOpen size={13} className="metric-icon cyan" />
            <span>SPIRES</span>
          </span>
          <strong className="metric-number cyan-glow">
            {completed} <small>/ {totalModules}</small>
          </strong>
          <span className="metric-sub">Realms Mastered</span>
        </div>
      </div>
    </motion.header>
  )
}

function formatNewsDate(value) {
  if (!value) return 'Recent Dispatch'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recent Dispatch'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function getArticleCategory(article) {
  const text = `${article.title || ''} ${article.description || ''}`.toLowerCase()
  if (text.includes('ai') || text.includes('gpt') || text.includes('llm') || text.includes('model') || text.includes('neural') || text.includes('machine learning')) {
    return { name: '🔮 AI REALM', tone: 'violet' }
  }
  if (text.includes('cloud') || text.includes('aws') || text.includes('azure') || text.includes('server') || text.includes('kubernetes')) {
    return { name: '☁️ CLOUD CITADEL', tone: 'cyan' }
  }
  if (text.includes('security') || text.includes('hack') || text.includes('breach') || text.includes('vulnerability') || text.includes('auth')) {
    return { name: '🛡️ CYBER AEGIS', tone: 'electric' }
  }
  if (text.includes('data') || text.includes('database') || text.includes('sql') || text.includes('analytics') || text.includes('python')) {
    return { name: '💎 DATA REALM', tone: 'mint' }
  }
  if (text.includes('web') || text.includes('browser') || text.includes('css') || text.includes('react') || text.includes('javascript') || text.includes('code')) {
    return { name: '🌐 WEB SPIRE', tone: 'blue' }
  }
  return { name: '⚡ TECH DISPATCH', tone: 'gold' }
}

function DashboardPageView() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [progressData, setProgressData] = useState(null)
  const [learningPath, setLearningPath] = useState(null)
  const [progressLoading, setProgressLoading] = useState(true)
  const [progressError, setProgressError] = useState('')
  const [codingChallenges, setCodingChallenges] = useState([])
  const [badges, setBadges] = useState([])
  const [streak, setStreak] = useState(null)
  const [currentUserRank, setCurrentUserRank] = useState(null)
  const [unlockedBadge, setUnlockedBadge] = useState(null)
  const [adaptiveProfile, setAdaptiveProfile] = useState(null)
  const [newsState, setNewsState] = useState({ status: 'loading', articles: [], error: '' })
  const [newsAttempt, setNewsAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/news', { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => null)
        if (!response.ok || data?.success !== true || !Array.isArray(data.articles)) {
          throw new Error(data?.message || 'Tech news is temporarily unavailable. Please try again.')
        }
        return data.articles
      })
      .then((articles) => setNewsState({ status: articles.length ? 'loaded' : 'empty', articles, error: '' }))
      .catch((error) => {
        if (error.name !== 'AbortError') setNewsState({ status: 'error', articles: [], error: error.message })
      })
    return () => controller.abort()
  }, [newsAttempt])

  useEffect(() => {
    if (!token) return
    fetch('/api/progress/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Learning paths are unavailable right now.')
        return response.json()
      })
      .then((data) => {
        setProgressData(data?.progress || null)
        setLearningPath(data?.progress?.learningPath || null)
      })
      .catch((error) => {
        setProgressData(null)
        setLearningPath(null)
        setProgressError(error.message || 'Learning paths are unavailable right now.')
      })
      .finally(() => setProgressLoading(false))
  }, [token])

  useEffect(() => {
    if (!token) return
    fetch('/api/coding/challenges', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setCodingChallenges(data?.challenges || []))
      .catch(() => setCodingChallenges([]))
  }, [token, progressData?.completedModuleCount])

  useEffect(() => {
    if (!token) return
    Promise.all([
      fetch('/api/badges', { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : null)),
      fetch('/api/streak', { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : null)),
      fetch('/api/leaderboard?limit=5', { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : null)),
    ]).then(([badgeData, streakData, leaderboardData]) => {
      const earned = badgeData?.badges || []
      setBadges(earned)
      setStreak(streakData?.streak || null)
      setCurrentUserRank(leaderboardData?.currentUser || null)
      const seen = new Set(JSON.parse(localStorage.getItem('techverse-seen-badges') || '[]'))
      const unseen = earned.find((badge) => badge.earned && !seen.has(badge.id))
      if (unseen) {
        setUnlockedBadge(unseen)
        earned.filter((badge) => badge.earned).forEach((badge) => seen.add(badge.id))
        localStorage.setItem('techverse-seen-badges', JSON.stringify([...seen]))
      }
    }).catch(() => {})
  }, [token, progressData?.totalXP])

  useEffect(() => {
    if (!token) return
    fetch('/api/adaptive/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setAdaptiveProfile(data?.profile || null))
      .catch(() => setAdaptiveProfile(null))
  }, [token, progressData?.totalXP, progressData?.completedModuleCount])

  const recommendations = useMemo(() => {
    const domains = [...(adaptiveProfile?.domains || [])]
      .sort((first, second) => second.priorityScore - first.priorityScore)
    const paths = learningPath?.paths || []
    const selected = []
    const activity = adaptiveProfile?.recommendedActivity

    if (activity) {
      selected.push({
        title: formatLearningTitle(activity.title),
        description: `${activity.domain} · ${activity.difficulty}`,
        route: activity.route,
        label: 'ORACLE PICK',
        icon: BrainCircuit,
      })
    }

    for (const domain of domains) {
      if (selected.length >= 3) break
      const path = paths.find((candidate) => candidate.domain === domain.domain)
      const nextModule = path?.modules.find((module) => module.status === 'unlocked')
      if (!nextModule || selected.some((item) => item.route === `/learn/${nextModule.id}`)) continue
      selected.push({
        title: formatLearningTitle(nextModule.title),
        description: `${domain.domain} · ${domain.level}`,
        route: `/learn/${nextModule.id}`,
        label: 'KINGDOM PATH',
        icon: BookOpen,
      })
    }

    return selected
  }, [adaptiveProfile, learningPath])

  const overallProgress = progressData?.overallProgress ?? null
  const progressValue = overallProgress ?? 0
  const accessibleModules = progressData?.totalAccessibleModules ?? 12
  const completedModules = progressData?.completedModuleCount ?? 0
  const quizAttempts = adaptiveProfile?.summary?.quiz?.attempts
  const completedChallenges = codingChallenges.filter((challenge) => challenge.status === 'completed').length
  const earnedBadges = badges.filter((badge) => badge.earned).length

  return (
    <main className="tv-kingdom-dashboard" id="dashboard-top">
      {/* RPG HUD Player Header (Requirement 8) */}
      <PlayerHeader
        user={user}
        progress={progressData}
        badges={badges}
        streak={streak}
        rank={currentUserRank}
      />

      {/* Tech Kingdom Map Experience (Requirement 4) */}
      <CrystalWorld
        paths={learningPath?.paths || []}
        loading={progressLoading}
        error={progressError}
        onSelectIsland={(path, module) => navigate(module ? `/learn/${module.id}` : '/worlds')}
        onSelectCitadel={() => navigate('/worlds')}
      />

      {/* Main Dashboard Interactive Activities Grid */}
      <section className="crystal-dashboard-content">
        {/* 3D Tilt Feature Cards (Requirement 3) */}
        <section className="tv-feature-grid" aria-label="Kingdom Activities">
          <FeatureCard
            to="/worlds"
            icon={BookOpen}
            title="Learn Realms"
            description="Conquer technology domains"
            tone="violet"
          />
          <FeatureCard
            to={progressData?.currentModule ? `/learn/${progressData.currentModule.moduleId}?view=quiz` : '/worlds'}
            icon={CircleHelp}
            title="Knowledge Quizzes"
            description="Test technical mastery"
            tone="indigo"
          />
          <FeatureCard
            to="/coding"
            icon={Code2}
            title="Coding Sanctum"
            description="Solve algorithmic quests"
            tone="cyan"
          />
          <FeatureCard
            to="/battle"
            icon={Swords}
            title="Battle Arena"
            description="Duel rivals & earn XP"
            tone="blue"
          />
        </section>

        {/* Lower Kingdom Section: Progress, Recommendations, News */}
        <section className="tv-lower-grid">
          {/* Progress Overview Card */}
          <article className="tv-content-card tv-progress-card">
            <div className="tv-card-heading">
              <div>
                <p className="tv-section-eyebrow">DOMAINS CONQUERED</p>
                <h3>Your Kingdom Progress</h3>
              </div>
              <Link to="/profile" className="tv-card-link" aria-label="View full progress">
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="tv-progress-overview">
              <div className="tv-progress-ring" style={{ '--progress-value': `${progressValue}%` }}>
                <div>
                  <strong>{overallProgress === null ? '—' : `${overallProgress}%`}</strong>
                  <small>CAMPAIGN</small>
                </div>
              </div>
              <p>
                <strong>{completedModules}</strong> of {accessibleModules} modules completed across realms
              </p>
            </div>

            <div className="tv-progress-list">
              <div>
                <span className="tv-progress-label">
                  <BookOpen size={15} /> Spires completed
                </span>
                <strong>
                  {completedModules} <small>/ {accessibleModules}</small>
                </strong>
              </div>
              <div>
                <span className="tv-progress-label">
                  <CircleHelp size={15} /> Quiz trials
                </span>
                <strong>{quizAttempts ?? '—'}</strong>
              </div>
              <div>
                <span className="tv-progress-label">
                  <Code2 size={15} /> Coding challenges solved
                </span>
                <strong>
                  {codingChallenges.length ? `${completedChallenges} / ${codingChallenges.length}` : '—'}
                </strong>
              </div>
              <div>
                <span className="tv-progress-label">
                  <Award size={15} /> Royal relics collected
                </span>
                <strong>
                  {badges.length ? `${earnedBadges} / ${badges.length}` : '—'}
                </strong>
              </div>
            </div>

            <div className="tv-progress-footer">
              <span>
                <Flame size={15} /> {streak?.currentStreak ?? 1} day streak
              </span>
              <Link to="/leaderboard">
                {currentUserRank?.rank ? `Rank #${currentUserRank.rank}` : 'Hall of Champions'}{' '}
                <ChevronRight size={14} />
              </Link>
            </div>
          </article>

          {/* AI Recommended Quests Card */}
          <article className="tv-content-card tv-recommend-card">
            <div className="tv-card-heading">
              <div>
                <p className="tv-section-eyebrow">AI WIZARD ORACLE</p>
                <h3>Recommended for You</h3>
              </div>
              <span className="tv-ai-badge">
                <Sparkles size={13} /> GEMINI AI
              </span>
            </div>

            <div className="tv-recommend-list">
              {recommendations.length ? (
                recommendations.map((recommendation, index) => {
                  const Icon = recommendation.icon
                  return (
                    <Link
                      to={recommendation.route}
                      className={`tv-recommend-row tone-${index}`}
                      key={`${recommendation.route}-${recommendation.title}`}
                    >
                      <span className="tv-recommend-icon">
                        <Icon size={17} />
                      </span>
                      <span className="tv-recommend-copy">
                        <strong>{recommendation.title}</strong>
                        <small>{recommendation.description}</small>
                      </span>
                      <span className="tv-recommend-label">{recommendation.label}</span>
                      <ChevronRight className="tv-recommend-arrow" size={16} />
                    </Link>
                  )
                })
              ) : (
                <div className="tv-recommend-empty">
                  <BrainCircuit size={20} />
                  <span>
                    {adaptiveProfile
                      ? 'All current recommendations mastered!'
                      : 'Consulting the AI Oracle for your next skill recommendation...'}
                  </span>
                </div>
              )}
            </div>

            <Link className="tv-recommend-footer" to="/ai-lab">
              Enter AI Wizard Tower <ArrowRight size={15} />
            </Link>
          </article>

          {/* Tech Updates UI (Requirement 11) */}
          <article className="tv-content-card tv-news-card" id="tech-news">
            <div className="tv-card-heading">
              <div>
                <p className="tv-section-eyebrow">THE TECH CHRONICLES</p>
                <h3>Latest Realm Transmissions</h3>
              </div>
              <span className="tv-news-mark">
                <Newspaper size={17} />
              </span>
            </div>

            {newsState.status === 'loading' && (
              <div className="tv-news-state" role="status">
                <span className="tv-news-empty-icon">
                  <Newspaper size={21} />
                </span>
                <strong>ENTERING THE CRYSTAL REALM...</strong>
                <p>Receiving royal tech transmissions from across the kingdoms.</p>
              </div>
            )}

            {newsState.status === 'empty' && (
              <div className="tv-news-state">
                <span className="tv-news-empty-icon">
                  <Newspaper size={21} />
                </span>
                <strong>THE CHRONICLES ARE QUIET</strong>
                <p>Live technology updates will appear here when the news service is connected.</p>
              </div>
            )}

            {newsState.status === 'error' && (
              <div className="tv-news-state" role="alert">
                <span className="tv-news-empty-icon">
                  <Newspaper size={21} />
                </span>
                <strong>Transmissions temporarily offline</strong>
                <p>{newsState.error}</p>
                <button
                  className="tv-news-retry"
                  type="button"
                  onClick={() => {
                    setNewsState({ status: 'loading', articles: [], error: '' })
                    setNewsAttempt((attempt) => attempt + 1)
                  }}
                >
                  Reconnect <ArrowRight size={14} />
                </button>
              </div>
            )}

            {newsState.status === 'loaded' && (
              <div className="tv-news-articles">
                {newsState.articles.slice(0, 6).map((article) => {
                  const cat = getArticleCategory(article)
                  return (
                    <Tilt
                      key={article.url}
                      tiltMaxAngleX={6}
                      tiltMaxAngleY={6}
                      scale={1.01}
                      transitionSpeed={300}
                      glareEnable={false}
                      className="tv-news-tilt-wrap"
                    >
                      <article className="tv-news-article">
                        {article.imageUrl ? (
                          <img className="tv-news-image" src={article.imageUrl} alt="" loading="lazy" />
                        ) : (
                          <span className="tv-news-image tv-news-image-empty">
                            <Newspaper size={24} />
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
                            <span className="tv-news-source">{article.source}</span>
                            <a
                              className="tv-news-read-more"
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span>Read Story</span>
                              <ExternalLink size={13} />
                            </a>
                          </div>
                        </div>
                      </article>
                    </Tilt>
                  )
                })}
              </div>
            )}
          </article>
        </section>
      </section>

      <AnimatePresence>
        {unlockedBadge && (
          <BadgeUnlockToast badge={unlockedBadge} onClose={() => setUnlockedBadge(null)} />
        )}
      </AnimatePresence>
    </main>
  )
}

export default DashboardPageView