import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Code2,
  Compass,
  Database,
  Globe2,
  LockKeyhole,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import formatLearningTitle from '../utils/formatLearningTitle'

const domainMeta = [
  { match: 'artificial intelligence', icon: BrainCircuit, tone: 'violet', label: 'AI Neural Kingdom', realmType: 'Archmage Spire' },
  { match: 'web development', icon: Globe2, tone: 'cyan', label: 'Web Crystal City', realmType: 'Holographic Bastion' },
  { match: 'cloud computing', icon: Cloud, tone: 'teal', label: 'Cloud Sky Kingdom', realmType: 'Floating Citadel' },
  { match: 'cybersecurity', icon: Shield, tone: 'electric', label: 'Cyber Fortress', realmType: 'Quantum Aegis' },
  { match: 'data science', icon: Database, tone: 'mint', label: 'Data Vault', realmType: 'Crystal Observatory' },
  { match: 'programming', icon: Code2, tone: 'pink', label: 'Python Crystal Realm', realmType: 'Algorithmic Forge' },
]

function getDomainMeta(domain) {
  return domainMeta.find(({ match }) => domain.toLowerCase().includes(match)) || {
    icon: Code2,
    tone: 'violet',
    label: domain,
    realmType: 'Technology Realm',
  }
}

export default function WorldsPage() {
  const { token } = useAuth()
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/progress/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load kingdom learning paths')
        if (active) setPaths(data.progress?.learningPath?.paths || [])
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Learning paths are unavailable')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [token])

  const moduleCount = paths.reduce((total, path) => total + path.modules.length, 0)
  const completedCount = paths.reduce((total, path) => total + (path.completedModuleCount || 0), 0)

  return (
    <main className="learn-page">
      <div className="tv-cosmic-bg" aria-hidden="true"><div className="tv-cosmic-stars" /></div>

      {/* Header */}
      <header className="learn-page-header">
        <div>
          <p className="crystal-eyebrow">
            <span className="spark">✦</span> KINGDOM TOPOLOGY <span className="spark">✦</span>
          </p>
          <h1 className="crystal-title">
            EXPLORE THE <span className="highlight">TECHNOLOGY REALMS</span>
          </h1>
          <p className="crystal-subtitle">
            Every technology is an authentic crystal world. Journey through the connected spires to forge your engineering mastery.
          </p>
        </div>

        {!loading && !error && (
          <div className="learn-summary-pill crystal-panel">
            <Sparkles size={15} className="summary-spark" />
            <span>
              <strong>{completedCount}</strong> / {moduleCount} Spire Quests Conquered across {paths.length} Realms
            </span>
          </div>
        )}
      </header>

      {/* Error state */}
      {error && (
        <div className="crystal-state-box error" role="alert">
          <div className="crystal-state-gem"><Shield size={28} /></div>
          <h3 className="crystal-state-title">COMMUNICATION ANOMALY</h3>
          <p className="crystal-state-desc">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="crystal-state-box" role="status">
          <div className="crystal-loading-spinner" />
          <h3 className="crystal-state-title">ENTERING THE CRYSTAL REALM...</h3>
          <p className="crystal-state-desc">Mapping technology ley-lines and calibrating spires.</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && paths.length === 0 && (
        <div className="crystal-state-box">
          <div className="crystal-state-gem"><Compass size={32} /></div>
          <h3 className="crystal-state-title">THIS REALM IS CURRENTLY QUIET</h3>
          <p className="crystal-state-desc">
            Complete the Trial of Ascension to awaken your personalized curriculum.
          </p>
          <Link to="/placement" className="crystal-btn crystal-btn-primary">
            <Sparkles size={15} /> Begin Assessment
          </Link>
        </div>
      )}

      {/* World Map Realm Cards Grid */}
      {!loading && !error && paths.length > 0 && (
        <section className="course-grid" aria-label="Your learning paths">
          {paths.map((path, pIdx) => {
            const meta = getDomainMeta(path.domain)
            const Icon = meta.icon
            const completed = path.completedModuleCount || 0
            const progress = path.progressPercentage || 0
            const nextModule = path.modules.find((m) => m.status === 'unlocked')

            return (
              <motion.article
                className={`crystal-panel course-card tone-${meta.tone}`}
                key={path.domain}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: pIdx * 0.05 }}
              >
                {/* Header */}
                <header className="course-card-header">
                  <span className="course-icon">
                    <Icon size={22} />
                  </span>
                  <div className="course-header-meta">
                    <span className="course-realm-type">{meta.realmType}</span>
                    <strong className="course-domain">{path.domain}</strong>
                  </div>
                  <span className="crystal-chip cyan small">
                    {completed === path.modules.length ? 'Conquered' : `${completed}/${path.modules.length}`}
                  </span>
                </header>

                <h2 className="course-title">{formatLearningTitle(path.title || path.domain)}</h2>
                <p className="course-description">{path.description}</p>

                {/* Progress Bar */}
                <div className="course-progress-block">
                  <div className="course-progress-copy">
                    <span>Campaign Mastery</span>
                    <strong>{progress}%</strong>
                  </div>
                  <div
                    className="crystal-progress-track"
                    role="progressbar"
                    aria-label={`${path.domain} progress`}
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div className="crystal-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {/* Connected Spires Node Map */}
                <div className="course-spires-heading">
                  <span>SPIRE QUESTS</span>
                  <small>{path.modules.length} Nodes</small>
                </div>

                <ul className="course-module-list">
                  {path.modules.map((module, mIdx) => {
                    const isCompleted = module.status === 'completed'
                    const isLocked = module.status === 'locked'
                    const isUnlocked = module.status === 'unlocked'

                    return (
                      <li key={module.id} className={`course-module ${module.status}`}>
                        {/* Connected Ley-line */}
                        {mIdx < path.modules.length - 1 && (
                          <span className={`spire-ley-line ${isCompleted ? 'active' : ''}`} />
                        )}

                        <span className={`course-module-icon ${module.status}`}>
                          {isCompleted ? (
                            <CheckCircle2 size={16} className="icon-complete" />
                          ) : isLocked ? (
                            <LockKeyhole size={14} className="icon-locked" />
                          ) : (
                            <Code2 size={15} className="icon-unlocked" />
                          )}
                        </span>

                        <div className="course-module-copy">
                          <strong>{formatLearningTitle(module.title)}</strong>
                          <small>
                            {module.level || module.difficulty || path.domain} · +{module.xp} XP
                          </small>
                        </div>

                        {isUnlocked ? (
                          <Link
                            to={`/learn/${module.id}`}
                            className="crystal-btn crystal-btn-primary small module-enter-btn"
                            aria-label={`Enter ${formatLearningTitle(module.title)}`}
                          >
                            Enter <ChevronRight size={14} />
                          </Link>
                        ) : (
                          <span className={`course-module-status ${module.status}`}>
                            {isCompleted ? 'Mastered' : 'Sealed'}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>

                {/* Card Action */}
                <div className="course-card-actions">
                  {nextModule ? (
                    <Link className="crystal-btn crystal-btn-secondary course-continue-btn" to={`/learn/${nextModule.id}`}>
                      Continue Quest <ArrowRight size={15} />
                    </Link>
                  ) : (
                    <span className="course-complete-note">
                      <Sparkles size={14} /> All current spires in this realm conquered!
                    </span>
                  )}
                </div>
              </motion.article>
            )
          })}
        </section>
      )}
    </main>
  )
}
