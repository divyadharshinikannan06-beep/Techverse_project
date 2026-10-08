import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BrainCircuit,
  Cloud,
  Code2,
  Compass,
  Database,
  Globe2,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DomainCard, LoadingSkeleton, ErrorState, EmptyState } from '../components/ui'

const DOMAIN_CONFIG = [
  {
    key: 'ai',
    matches: ['artificial intelligence', 'ai', 'machine learning'],
    title: 'AI & Machine Learning',
    domain: 'Artificial Intelligence',
    realmType: 'Neural Spire',
    icon: BrainCircuit,
    tone: 'violet',
    difficulty: 'Intermediate',
    xpReward: 600,
    description: 'Explore neural networks, LLM prompting, generative systems, and machine learning frontiers.',
    defaultRoute: '/worlds',
  },
  {
    key: 'web',
    matches: ['web development', 'web', 'frontend'],
    title: 'Web Development',
    domain: 'Web Development',
    realmType: 'Holographic Spire',
    icon: Globe2,
    tone: 'cyan',
    difficulty: 'Beginner - Pro',
    xpReward: 550,
    description: 'Master semantic web architecture, modern reactive frameworks, client-server conduits, and DOM craft.',
    defaultRoute: '/worlds',
  },
  {
    key: 'cloud',
    matches: ['cloud computing', 'cloud', 'devops'],
    title: 'Cloud Computing',
    domain: 'Cloud Computing',
    realmType: 'Floating Citadel',
    icon: Cloud,
    tone: 'teal',
    difficulty: 'Intermediate',
    xpReward: 500,
    description: 'Deploy distributed server bastions, container orchestration, microservices, and elastic cloud scaling.',
    defaultRoute: '/worlds',
  },
  {
    key: 'cyber',
    matches: ['cybersecurity', 'security'],
    title: 'Cybersecurity',
    domain: 'Cybersecurity',
    realmType: 'Quantum Aegis',
    icon: Shield,
    tone: 'electric',
    difficulty: 'Advanced',
    xpReward: 650,
    description: 'Fortify digital perimeters with ethical hacking, cryptographic ciphers, threat modeling, and defensive security.',
    defaultRoute: '/worlds',
  },
  {
    key: 'data',
    matches: ['data science', 'data', 'analytics'],
    title: 'Data Science',
    domain: 'Data Science',
    realmType: 'Crystal Observatory',
    icon: Database,
    tone: 'mint',
    difficulty: 'Beginner - Intermediate',
    xpReward: 500,
    description: 'Uncover deep insights through statistical modeling, exploratory analytics, data pipelines, and visualizations.',
    defaultRoute: '/worlds',
  },
]

export default function ExplorePage() {
  const { token } = useAuth()
  const navigate = useNavigate()
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
        if (active) setError(loadError.message || 'Learning realms are currently unavailable')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [token])

  // Map each configured domain to live progress data
  const domainCards = DOMAIN_CONFIG.map((config) => {
    const livePath = paths.find((p) =>
      config.matches.some((m) => p.domain?.toLowerCase().includes(m))
    )

    const modules = livePath?.modules || []
    const completedCount = livePath?.completedModuleCount || 0
    const moduleCount = modules.length || 3
    const progress = livePath?.progressPercentage || (moduleCount > 0 ? Math.round((completedCount / moduleCount) * 100) : 0)
    const nextModule = modules.find((m) => m.status === 'unlocked')
    const targetRoute = nextModule ? `/learn/${nextModule.id}` : '/worlds'

    return {
      ...config,
      completedCount,
      moduleCount,
      progress,
      to: targetRoute,
    }
  })

  const totalModules = paths.reduce((acc, p) => acc + (p.modules?.length || 0), 0)
  const totalCompleted = paths.reduce((acc, p) => acc + (p.completedModuleCount || 0), 0)

  return (
    <main className="explore-page">
      <div className="tv-cosmic-bg" aria-hidden="true">
        <div className="tv-cosmic-stars" />
      </div>

      <div className="explore-shell">
        {/* Hero Section */}
        <header className="explore-hero-panel">
          <div className="explore-hero-copy">
            <p className="crystal-eyebrow">
              <span className="spark">✦</span> REALM DISCOVERY NEXUS <span className="spark">✦</span>
            </p>
            <h1 className="crystal-title">
              EXPLORE THE <span className="highlight">TECH KINGDOM</span>
            </h1>
            <p className="crystal-subtitle">
              Discover technologies, learning paths and new skills. Journey through crystalline spires and forge your engineering mastery.
            </p>
          </div>

          <div className="explore-hero-stats">
            <div className="crystal-chip cyan">
              <Sparkles size={14} />
              <span>5 Technology Realms</span>
            </div>
            {totalModules > 0 && (
              <div className="crystal-chip gold">
                <Zap size={14} />
                <span>{totalCompleted} / {totalModules} Spires Mastered</span>
              </div>
            )}
          </div>
        </header>

        {/* Error State */}
        {error && (
          <ErrorState
            title="REALM CONDUIT DISRUPTED"
            message={error}
            onRetry={() => window.location.reload()}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="crystal-state-box" role="status">
            <div className="crystal-loading-spinner" />
            <h3 className="crystal-state-title">ENTERING THE CRYSTAL REALM...</h3>
            <p className="crystal-state-desc">Mapping technology domains and kingdom ley-lines.</p>
          </div>
        )}

        {/* Technology Domain Cards Grid */}
        {!loading && !error && (
          <section className="explore-grid" aria-label="Technology Domains">
            {domainCards.map((domain, index) => (
              <DomainCard
                key={domain.key}
                title={domain.title}
                domain={domain.domain}
                realmType={domain.realmType}
                description={domain.description}
                difficulty={domain.difficulty}
                progress={domain.progress}
                xpReward={domain.xpReward}
                icon={domain.icon}
                tone={domain.tone}
                to={domain.to}
                completedCount={domain.completedCount}
                moduleCount={domain.moduleCount}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
