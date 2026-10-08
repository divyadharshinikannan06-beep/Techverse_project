import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  BookOpen,
  BrainCircuit,
  Cloud,
  Code2,
  Compass,
  Cpu,
  Database,
  Globe2,
  Lock,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import crystalHero from '../assets/techverse-crystal-hero.png'
import TechVerseFooter from '../components/TechVerseFooter'

const technologyRealms = [
  {
    id: 'ai',
    name: 'AI Neural Kingdom',
    domain: 'Artificial Intelligence',
    icon: BrainCircuit,
    tone: 'violet',
    accentColor: '#7B61FF',
    glowColor: 'rgba(123, 97, 255, 0.4)',
    realmType: 'Archmage Spire',
    description: 'Master neural architectures, LLM reasoning, deep learning, and Gemini AI agents within the high crystal sanctums.',
    spires: '3 Spires · 12 Quests',
    status: 'Unlocked',
    modules: ['Machine Learning Foundations', 'Deep Neural Networks', 'AI Systems & Gemini'],
  },
  {
    id: 'web',
    name: 'Web Crystal City',
    domain: 'Web Development',
    icon: Globe2,
    tone: 'cyan',
    accentColor: '#22D3EE',
    glowColor: 'rgba(34, 211, 238, 0.4)',
    realmType: 'Holographic Bastion',
    description: 'Architect modern responsive interfaces, distributed DOM structures, React frameworks, and resilient APIs.',
    spires: '3 Spires · 12 Quests',
    status: 'Unlocked',
    modules: ['HTML & Semantic Architectures', 'Modern JavaScript / ESNext', 'React & State Concurrency'],
  },
  {
    id: 'cloud',
    name: 'Cloud Sky Kingdom',
    domain: 'Cloud Computing',
    icon: Cloud,
    tone: 'teal',
    accentColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    realmType: 'Floating Citadel',
    description: 'Deploy resilient container fleets, orchestrate serverless pipelines, and engineer global cloud backbones.',
    spires: '2 Spires · 8 Quests',
    status: 'Unlocked',
    modules: ['Cloud Infrastructure Fundamentals', 'Containers & Kubernetes Mesh'],
  },
  {
    id: 'cyber',
    name: 'Cyber Fortress',
    domain: 'Cybersecurity',
    icon: Shield,
    tone: 'electric',
    accentColor: '#6366F1',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    realmType: 'Quantum Aegis',
    description: 'Fortify digital bastions against intrusions, conduct security auditing, cryptographic checks, and token defense.',
    spires: '2 Spires · 8 Quests',
    status: 'Unlocked',
    modules: ['Network Security & Cryptography', 'Application Hardening & Defense'],
  },
  {
    id: 'data',
    name: 'Data Vault',
    domain: 'Data Science',
    icon: Database,
    tone: 'mint',
    accentColor: '#2DD4BF',
    glowColor: 'rgba(45, 212, 191, 0.4)',
    realmType: 'Crystal Observatory',
    description: 'Unearth ancient patterns in massive datasets, engineer analytics pipelines, and run statistical predictive models.',
    spires: '2 Spires · 8 Quests',
    status: 'Unlocked',
    modules: ['Data Wrangling & SQL Foundations', 'Statistical Inference & Analytics'],
  },
  {
    id: 'python',
    name: 'Python Crystal Realm',
    domain: 'Programming & Algorithms',
    icon: Code2,
    tone: 'pink',
    accentColor: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    realmType: 'Algorithmic Forge',
    description: 'Forge clean, optimized code. Solve competitive algorithmic challenges, data structure quests, and performance trials.',
    spires: '3 Spires · 14 Quests',
    status: 'Unlocked',
    modules: ['Python Algorithmic Principles', 'Data Structures & Efficiency', 'Dynamic Problem Solving'],
  },
]

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const [activeRealm, setActiveRealm] = useState(technologyRealms[0])

  return (
    <div className="landing-crystal-universe">
      {/* Background Cosmic Canvas */}
      <div className="tv-cosmic-bg" aria-hidden="true">
        <div className="tv-cosmic-stars" />
        <div className="landing-nebula nebula-violet" />
        <div className="landing-nebula nebula-cyan" />
      </div>

      {/* Cinematic Navigation */}
      <header className="landing-topbar">
        <div className="landing-brand-lockup">
          <div className="kingdom-brand-mark">
            <span className="brand-orbital-ring" />
            <span className="brand-tv-monogram">TV</span>
            <Sparkles size={11} className="brand-diamond-sparkle" />
          </div>
          <div className="landing-brand-text">
            <span className="brand-name">TechVerse</span>
            <span className="brand-tag">CRYSTAL KINGDOM</span>
          </div>
        </div>

        <nav className="landing-links" aria-label="Main Navigation">
          <a href="#citadel" className="landing-nav-link">Citadel</a>
          <a href="#realms" className="landing-nav-link">Technology Realms</a>
          <a href="#arena" className="landing-nav-link">Coding Arena</a>
          <a href="#lore" className="landing-nav-link">Citadel Lore</a>
        </nav>

        <div className="landing-auth-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="crystal-btn crystal-btn-primary">
              <Sparkles size={16} /> Enter Citadel
            </Link>
          ) : (
            <>
              <Link to="/login" className="crystal-btn crystal-btn-ghost">
                Sign in
              </Link>
              <Link to="/register" className="crystal-btn crystal-btn-primary">
                Enter TechVerse <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ============================================================
          1. FULL SCREEN CINEMATIC HERO SECTION
         ============================================================ */}
      <section className="landing-hero-section" id="citadel">
        {/* Central Visual: The TechVerse Crystal Citadel */}
        <div className="hero-citadel-stage">
          <div className="hero-citadel-energy-aura" aria-hidden="true" />
          <div className="hero-citadel-rings" aria-hidden="true">
            <span className="orbit-ring ring-1" />
            <span className="orbit-ring ring-2" />
            <span className="orbit-ring ring-3" />
          </div>

          <motion.div
            className="hero-citadel-artwork-wrap"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <img
              src={crystalHero}
              alt="The TechVerse Crystal Citadel floating amidst crystalline islands"
              className="hero-citadel-img"
            />
            <div className="hero-citadel-core-spark" />
          </motion.div>

          {/* Floating Energy Shards */}
          <div className="hero-floating-shards" aria-hidden="true">
            <span className="shard shard-1" />
            <span className="shard shard-2" />
            <span className="shard shard-3" />
            <span className="shard shard-4" />
          </div>
        </div>

        {/* Hero Copy & Inscriptions */}
        <motion.div
          className="hero-proclamation"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="crystal-eyebrow">
            <span className="spark">✦</span> ENTER THE CRYSTAL KINGDOM OF TECHNOLOGY <span className="spark">✦</span>
          </div>

          <h1 className="hero-title">
            TECH<span className="highlight">VERSE</span>
          </h1>

          <p className="hero-motto">
            "LEARN • PRACTICE • COMPETE • GROW"
          </p>

          <p className="hero-narrative">
            Step beyond ordinary dashboards into a living fantasy universe where every engineering discipline
            is a futuristic crystal kingdom. Conquer algorithmic quests, duel in knowledge arenas, and level up with Gemini AI mentorship.
          </p>

          {/* Main Action CTAs */}
          <div className="hero-cta-group">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="crystal-btn crystal-btn-primary large"
            >
              <Sparkles size={18} /> ENTER TECHVERSE
            </Link>

            <a
              href="#realms"
              className="crystal-btn crystal-btn-secondary large"
            >
              <Compass size={18} /> EXPLORE WORLDS
            </a>
          </div>

          {/* 4 Core Pillars Strip */}
          <div className="hero-pillars-strip">
            <div className="pillar-item">
              <Code2 size={16} className="pillar-icon cyan" />
              <span>Python &amp; Code Sanctum</span>
            </div>
            <div className="pillar-item">
              <BrainCircuit size={16} className="pillar-icon violet" />
              <span>AI Neural Kingdom</span>
            </div>
            <div className="pillar-item">
              <Swords size={16} className="pillar-icon pink" />
              <span>Real-Time Arena Duels</span>
            </div>
            <div className="pillar-item">
              <Trophy size={16} className="pillar-icon gold" />
              <span>Royal Relics &amp; Ranks</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Ornamental Divider */}
      <div className="crystal-divider">
        <span className="crystal-divider-gem" />
      </div>

      {/* ============================================================
          2. TECHNOLOGY REALMS SECTION ("EXPLORE THE TECHNOLOGY REALMS")
         ============================================================ */}
      <section className="landing-realms-section" id="realms">
        <div className="realms-section-header">
          <p className="crystal-eyebrow">
            <span className="spark">✦</span> KINGDOM TOPOLOGY
          </p>
          <h2 className="crystal-title">
            EXPLORE THE <span className="highlight">TECHNOLOGY REALMS</span>
          </h2>
          <p className="crystal-subtitle">
            Every technology is represented as an authentic futuristic crystal kingdom.
            Journey through spire quests, practice challenges, and earn server-awarded XP.
          </p>
        </div>

        {/* Real Technology World Cards Grid */}
        <div className="realms-card-grid">
          {technologyRealms.map((realm, index) => {
            const Icon = realm.icon
            return (
              <motion.article
                key={realm.id}
                className={`realm-fantasy-card tone-${realm.tone}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -6 }}
              >
                {/* Glowing Border & Shimmer */}
                <div className="realm-card-aura" aria-hidden="true" />

                <div className="realm-card-top">
                  <span className="realm-card-icon" style={{ borderColor: realm.accentColor }}>
                    <Icon size={24} style={{ color: realm.accentColor }} />
                  </span>
                  <div className="realm-card-badge">
                    <span className="realm-type-label">{realm.realmType}</span>
                    <span className="realm-status-pill">{realm.status}</span>
                  </div>
                </div>

                <div className="realm-card-body">
                  <h3 className="realm-name">{realm.name}</h3>
                  <p className="realm-domain-tag">{realm.domain}</p>
                  <p className="realm-desc">{realm.description}</p>

                  <div className="realm-spires-preview">
                    <strong>SPIRE PATHS:</strong>
                    <ul>
                      {realm.modules.map((mod) => (
                        <li key={mod}>
                          <Sparkles size={11} className="mod-sparkle" /> {mod}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="realm-card-footer">
                  <span className="realm-spires-count">{realm.spires}</span>
                  <Link
                    to={isAuthenticated ? "/worlds" : "/register"}
                    className="crystal-btn crystal-btn-secondary small realm-explore-btn"
                  >
                    Explore Realm <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.article>
            )
          })}
        </div>
      </section>

      {/* Ornamental Divider */}
      <div className="crystal-divider">
        <span className="crystal-divider-gem" />
      </div>

      {/* ============================================================
          3. CODING ARENA & BATTLE SHOWCASE
         ============================================================ */}
      <section className="landing-arena-section" id="arena">
        <div className="arena-showcase-panel crystal-panel">
          <div className="arena-copy-col">
            <p className="crystal-eyebrow">
              <span className="spark">✦</span> BATTLE ARENA &amp; CODING SANCTUM
            </p>
            <h2 className="crystal-title">
              Forge Code. <span className="highlight">Duel Rivals.</span>
            </h2>
            <p className="crystal-subtitle">
              Test your algorithmic craft in real-time coding sanctums supporting Python and JavaScript.
              Face opponent challenges where correct answers reduce enemy health and earn you server-validated Crystal XP.
            </p>

            <div className="arena-features-list">
              <div className="arena-feature">
                <span className="feat-gem" />
                <div>
                  <strong>Algorithmic Battle Arena</strong>
                  <p>Turn technical problem solving into interactive knowledge clashes.</p>
                </div>
              </div>
              <div className="arena-feature">
                <span className="feat-gem" />
                <div>
                  <strong>Gemini AI Wizard Oracle</strong>
                  <p>Receive adaptive study guidance and targeted recommendations.</p>
                </div>
              </div>
              <div className="arena-feature">
                <span className="feat-gem" />
                <div>
                  <strong>Royal Relic Collectibles</strong>
                  <p>Unlock prestigious crystal badges and claim high ranking on the Citadel pedestal.</p>
                </div>
              </div>
            </div>

            <div className="arena-cta-row">
              <Link
                to={isAuthenticated ? "/coding" : "/register"}
                className="crystal-btn crystal-btn-primary"
              >
                <Code2 size={16} /> Enter Coding Sanctum
              </Link>
              <Link
                to={isAuthenticated ? "/battle" : "/login"}
                className="crystal-btn crystal-btn-secondary"
              >
                <Swords size={16} /> Challenge Battle Arena
              </Link>
            </div>
          </div>

          <div className="arena-visual-col" aria-hidden="true">
            <div className="arena-hologram-frame">
              <div className="hologram-code-header">
                <span className="hologram-dot red" />
                <span className="hologram-dot yellow" />
                <span className="hologram-dot green" />
                <span className="hologram-filename">crystal_solution.py · Sanctum</span>
              </div>
              <pre className="hologram-code">
{`def unlock_realm_spire(power_crystals: list[int]) -> int:
    # Channel energy through the ley-lines
    ascension_xp = 0
    for resonance in power_crystals:
        if resonance >= REQUIRED_HARMONY:
            ascension_xp += resonance * REALM_MULTIPLIER
    return ascension_xp

# Trial passed · +100 Crystal XP`}
              </pre>
              <div className="hologram-footer">
                <span className="hologram-badge">✓ 5 / 5 Static Checks Passed</span>
                <span className="hologram-xp">+100 XP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ornamental Divider */}
      <div className="crystal-divider">
        <span className="crystal-divider-gem" />
      </div>

      {/* ============================================================
          4. CITADEL LORE & CALL TO ASCENSION
         ============================================================ */}
      <section className="landing-ascension-cta" id="lore">
        <div className="ascension-card crystal-panel">
          <div className="ascension-sparkle-center">
            <Sparkles size={36} className="center-gem" />
          </div>

          <p className="crystal-eyebrow">
            <span className="spark">✦</span> THE CITADEL AWAITS
          </p>

          <h2 className="ascension-title">
            Begin Your Ascension in <span className="highlight">TechVerse</span>
          </h2>

          <p className="ascension-desc">
            Take the Trial of Ascension to calibrate your personalized learning journey, or step straight into the technology realms.
          </p>

          <div className="ascension-actions">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="crystal-btn crystal-btn-primary large"
            >
              Begin Journey <ArrowRight size={17} />
            </Link>
            {!isAuthenticated && (
              <Link to="/login" className="crystal-btn crystal-btn-secondary large">
                Existing Adventurer Login
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Global Cinematic Footer */}
      <TechVerseFooter />
    </div>
  )
}
