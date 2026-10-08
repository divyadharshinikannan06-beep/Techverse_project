import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  Bell,
  BookOpen,
  BrainCircuit,
  Castle,
  ChevronRight,
  CircleHelp,
  Code2,
  Compass,
  Crown,
  Flame,
  House,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  Sparkles,
  Swords,
  Trophy,
  User,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import TechVerseFooter from './TechVerseFooter'
import './AppShell.css'

// Kingdom Navigation Structure (Preserves all existing routes & handlers)
const kingdomNavItems = [
  { id: 'dashboard', label: 'Home', to: '/dashboard', icon: House, section: 'kingdom' },
  { id: 'explore', label: 'Explore', to: '/explore', icon: Compass, section: 'world' },
  { id: 'learn', label: 'Learn', to: '/learn', icon: BookOpen, section: 'learning' },
  { id: 'practice', label: 'Practice', to: '/practice', icon: Code2, section: 'learning' },
  { id: 'battle-arena', label: 'Battle Arena', to: '/battle-arena', icon: Swords, section: 'world' },
  { id: 'leaderboard', label: 'Leaderboard', to: '/leaderboard', icon: Trophy, section: 'world' },
  { id: 'tech-news', label: 'Tech News', to: '/tech-news', icon: Newspaper, section: 'world' },
]

const pageDetails = [
  [/^\/dashboard/, ['TECHVERSE KINGDOM', 'Central Learning Citadel & Realm Map']],
  [/^\/explore/, ['EXPLORE THE TECH KINGDOM', 'Discover Technologies & Learning Paths']],
  [/^\/worlds/, ['LEARNING REALMS', 'Explore Technology Domains & Spires']],
  [/^\/learn\//, ['KNOWLEDGE TRIAL', 'Master Domain Principles & Practical Skills']],
  [/^\/learn/, ['LEARNING DOMAINS', 'Journey Through Technology Spires']],
  [/^\/practice/, ['CODING KINGDOM', 'Practice Problem Solving & Algorithmic Craft']],
  [/^\/coding\//, ['CODING SANCTUM', 'Solve Algorithmic Challenges & Forge Code']],
  [/^\/coding/, ['CODING KINGDOM', 'Practice Problem Solving & Algorithmic Craft']],
  [/^\/battle-arena/, ['BATTLE ARENA', 'Challenge Your Skills, Defeat Opponents, Earn XP']],
  [/^\/battle\//, ['BATTLE ARENA', 'Real-Time Knowledge Clash & Duels']],
  [/^\/battle/, ['BATTLE ARENA', 'Compete Against Rivals, Defend & Earn XP']],
  [/^\/(adaptive|ai-lab)/, ['AI WIZARD TOWER', 'Consult the Gemini AI Mentor & Oracle']],
  [/^\/leaderboard/, ['HALL OF CHAMPIONS', 'Rankings Across the Tech Realms']],
  [/^\/profile/, ['PLAYER SANCTUARY', 'Your Character Stats, Relics & Achievements']],
  [/^\/settings/, ['CRYSTAL CORE SETTINGS', 'Adventurer Preferences & Citadel Nexus']],
  [/^\/badges/, ['ROYAL RELICS', 'Milestones & Badges Forged in TechVerse']],
  [/^\/placement/, ['TRIAL OF ASCENSION', 'Assess Your Skills to Calibrate the Realm']],
  [/^\/onboarding/, ['GATEWAY OF TECHVERSE', 'Initialize Your Adventurer Identity']],
]

function KingdomBrandMark() {
  return (
    <div className="kingdom-brand-mark" aria-hidden="true">
      <div className="brand-crystal-glow" />
      <span className="brand-crystal-glyph">
        <span className="brand-orbital-ring" />
        <span className="brand-tv-monogram">TV</span>
        <Sparkles size={11} className="brand-diamond-sparkle" />
      </span>
      <span className="brand-spark-dot" />
    </div>
  )
}

function checkItemActive(location, item) {
  const { pathname, search, hash } = location
  const isQuizView = new URLSearchParams(search).get('view') === 'quiz'

  if (item.id === 'dashboard') {
    return pathname === '/dashboard' && !hash
  }
  if (item.id === 'explore') {
    return pathname === '/explore'
  }
  if (item.id === 'learn') {
    return (pathname === '/learn' || pathname === '/worlds' || pathname.startsWith('/learn/')) && !isQuizView
  }
  if (item.id === 'practice') {
    return pathname === '/practice' || pathname.startsWith('/coding')
  }
  if (item.id === 'battle-arena') {
    return pathname === '/battle-arena' || pathname.startsWith('/battle')
  }
  if (item.id === 'tech-news') {
    return pathname === '/tech-news' || (pathname === '/dashboard' && hash === '#tech-news')
  }
  if (item.id === 'leaderboard') {
    return pathname === '/leaderboard'
  }
  if (item.id === 'profile') {
    return pathname === '/profile'
  }
  if (item.id === 'settings') {
    return pathname === '/settings'
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export default function AppShell({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, token } = useAuth()
  const [moduleId, setModuleId] = useState('')
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [playerStats, setPlayerStats] = useState({ xp: user?.xp || 0, level: user?.level || 1, streak: 1 })

  const isQuizPage = location.pathname.startsWith('/learn/') && new URLSearchParams(location.search).get('view') === 'quiz'
  const page = isQuizPage
    ? ['KNOWLEDGE TRIAL', 'Test Your Domain Comprehension']
    : pageDetails.find(([pattern]) => pattern.test(location.pathname))?.[1] || ['TECHVERSE', 'Kingdom of Code & Wisdom']

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Apprentice'

  // Sync scroll on hash changes
  useEffect(() => {
    if (location.pathname !== '/dashboard' || !location.hash) return
    const target = document.getElementById(location.hash.slice(1))
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.pathname, location.hash])


  // Fetch current module & streak for HUD display
  useEffect(() => {
    let active = true
    if (!token || !user?.placementCompleted) return undefined

    Promise.all([
      fetch('/api/progress/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
      fetch('/api/streak', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
    ]).then(([progData, streakData]) => {
      if (!active) return
      if (progData?.progress?.currentModule?.moduleId) {
        setModuleId(progData.progress.currentModule.moduleId)
      }
      setPlayerStats({
        xp: progData?.progress?.totalXP ?? user?.xp ?? 0,
        level: user?.level || Math.max(1, Math.floor(((progData?.progress?.totalXP || 0) / 300) + 1)),
        streak: streakData?.streak?.currentStreak || 1,
      })
    }).catch(() => {})

    return () => { active = false }
  }, [token, user?.placementCompleted, user?.xp, user?.level])

  const navigateToQuiz = () => {
    navigate(moduleId ? `/learn/${moduleId}?view=quiz` : '/worlds')
  }

  const signOut = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="tv-kingdom-shell">
      {/* Background Animated Atmosphere */}
      <div className="kingdom-bg-aurora" aria-hidden="true" />
      <div className="kingdom-bg-stars" aria-hidden="true" />

      <div className="tv-kingdom-workspace">
        {/* ============================================================
            KINGDOM TOP HUD NAVIGATION BAR
           ============================================================ */}
        <header className="kingdom-topbar">
          {/* Logo & Realm Identifier */}
          <div className="kingdom-topbar-left">
            <Link to="/dashboard" className="kingdom-topbar-brand" title="TechVerse Kingdom — Return to Citadel">
              <KingdomBrandMark />
              <div className="kingdom-brand-text">
                <span className="brand-name">TechVerse</span>
                <span className="brand-tag">KINGDOM</span>
              </div>
            </Link>

            <div className="kingdom-realm-title">
              <span className="realm-eyebrow">{page[0]}</span>
              <p className="realm-sub">{page[1]}</p>
            </div>
          </div>

          {/* Desktop HUD Navigation Menu */}
          <nav className="kingdom-desktop-nav" aria-label="Kingdom Realms Navigation">
            {kingdomNavItems.map((item) => {
              const active = checkItemActive(location, item)
              const Icon = item.icon

              if (item.isQuiz) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={navigateToQuiz}
                    className={`kingdom-nav-pill ${active ? 'active' : ''}`}
                    title="Take domain quizzes"
                  >
                    <Icon size={15} className="nav-pill-icon" />
                    <span>{item.label}</span>
                    {active && <span className="nav-pill-glow" />}
                  </button>
                )
              }

              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={`kingdom-nav-pill ${active ? 'active' : ''}`}
                  title={item.label}
                >
                  <Icon size={15} className="nav-pill-icon" />
                  <span>{item.label}</span>
                  {active && <span className="nav-pill-glow" />}
                </Link>
              )
            })}
          </nav>

          {/* Player Quick-Stats HUD & Profile Actions */}
          <div className="kingdom-topbar-right">
            {/* RPG Quick Stats Pills */}
            <div className="kingdom-stats-hud">
              <div className="hud-pill hud-level" title={`Level ${playerStats.level}`}>
                <Crown size={12} className="hud-icon level-icon" />
                <span>LVL {playerStats.level}</span>
              </div>

              <div className="hud-pill hud-xp" title={`${playerStats.xp} Crystal XP`}>
                <Sparkles size={12} className="hud-icon xp-icon" />
                <span>{playerStats.xp.toLocaleString()} XP</span>
              </div>

              <div className="hud-pill hud-streak" title={`${playerStats.streak} Day Learning Streak`}>
                <Flame size={12} className="hud-icon streak-icon" />
                <span>{playerStats.streak}D</span>
              </div>
            </div>

            {/* Achievements Bell */}
            <Link
              to="/badges"
              className="kingdom-icon-btn badge-btn"
              aria-label="Achievements & Badges"
              title="Kingdom Achievements"
            >
              <Bell size={16} />
              <span className="icon-btn-dot" />
            </Link>

            {/* Player Avatar */}
            <Link
              to="/profile"
              className="kingdom-profile-crest"
              aria-label={`Open Player Profile for ${firstName}`}
              title={`${firstName} — Player Profile`}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" />
              ) : (
                <span className="profile-crest-initial">{firstName.slice(0, 1).toUpperCase()}</span>
              )}
              <span className="profile-crest-ring" />
            </Link>

            {/* Settings Link */}
            <Link
              to="/settings"
              className="kingdom-icon-btn settings-btn"
              aria-label="Crystal Core Settings"
              title="Crystal Core Settings"
            >
              <Settings size={16} />
            </Link>

            {/* Sign Out */}
            <button
              className="kingdom-icon-btn logout-btn"
              type="button"
              onClick={signOut}
              aria-label="Exit Realm"
              title="Leave Kingdom (Log Out)"
            >
              <LogOut size={16} />
            </button>

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              className="kingdom-mobile-toggle"
              type="button"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              aria-label="Toggle Kingdom Navigation Menu"
              aria-expanded={mobileDrawerOpen}
            >
              {mobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* ============================================================
            MOBILE / TABLET KINGDOM DRAWER (Requirement 7)
           ============================================================ */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <>
              <motion.div
                className="kingdom-drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileDrawerOpen(false)}
                aria-hidden="true"
              />

              <motion.aside
                className="kingdom-drawer-panel"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                aria-label="Mobile Kingdom Navigation"
              >
                <div className="drawer-header">
                  <div className="drawer-player-info">
                    <span className="drawer-avatar">
                      {user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : firstName.slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <strong>{user?.name || 'Apprentice'}</strong>
                      <span>Level {playerStats.level} · {playerStats.xp} XP</span>
                    </div>
                  </div>
                  <button
                    className="drawer-close-btn"
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    aria-label="Close Menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="drawer-sections">
                  {/* 🏰 KINGDOM */}
                  <div className="drawer-group">
                    <span className="drawer-group-title">🏰 KINGDOM</span>
                    <Link
                      to="/dashboard"
                      className={`drawer-link ${checkItemActive(location, { id: 'dashboard', to: '/dashboard' }) ? 'active' : ''}`}
                    >
                      <House size={16} />
                      <span>Dashboard &amp; Map</span>
                      <ChevronRight size={14} className="drawer-arrow" />
                    </Link>
                  </div>

                  {/* ⚔️ LEARNING */}
                  <div className="drawer-group">
                    <span className="drawer-group-title">⚔️ LEARNING</span>
                    <Link
                      to="/worlds"
                      className={`drawer-link ${checkItemActive(location, { id: 'learn', to: '/worlds' }) ? 'active' : ''}`}
                    >
                      <BookOpen size={16} />
                      <span>Learn Domains</span>
                      <ChevronRight size={14} className="drawer-arrow" />
                    </Link>
                    <button
                      type="button"
                      onClick={navigateToQuiz}
                      className={`drawer-link ${checkItemActive(location, { id: 'quiz' }) ? 'active' : ''}`}
                    >
                      <CircleHelp size={16} />
                      <span>Quizzes</span>
                      <ChevronRight size={14} className="drawer-arrow" />
                    </button>
                    <Link
                      to="/coding"
                      className={`drawer-link ${checkItemActive(location, { id: 'coding', to: '/coding' }) ? 'active' : ''}`}
                    >
                      <Code2 size={16} />
                      <span>Coding Arena</span>
                      <ChevronRight size={14} className="drawer-arrow" />
                    </Link>
                  </div>

                  {/* 🧙 SPECIAL */}
                  <div className="drawer-group">
                    <span className="drawer-group-title">🧙 SPECIAL</span>
                    <Link
                      to="/ai-lab"
                      className={`drawer-link ${checkItemActive(location, { id: 'ai-lab', to: '/ai-lab' }) ? 'active' : ''}`}
                    >
                      <BrainCircuit size={16} />
                      <span>AI Lab (Wizard Tower)</span>
                      <span className="drawer-badge-spark">✦ GEMINI</span>
                      <ChevronRight size={14} className="drawer-arrow" />
                    </Link>
                    <Link
                      to="/battle"
                      className={`drawer-link ${checkItemActive(location, { id: 'battle', to: '/battle' }) ? 'active' : ''}`}
                    >
                      <Swords size={16} />
                      <span>Battle Arena</span>
                      <ChevronRight size={14} className="drawer-arrow" />
                    </Link>
                  </div>

                  {/* 🌐 WORLD */}
                  <div className="drawer-group">
                    <span className="drawer-group-title">🌐 WORLD</span>
                    <Link
                      to="/dashboard#tech-news"
                      className={`drawer-link ${checkItemActive(location, { id: 'tech-news' }) ? 'active' : ''}`}
                    >
                      <Newspaper size={16} />
                      <span>Tech Updates</span>
                      <ChevronRight size={14} className="drawer-arrow" />
                    </Link>
                    <Link
                      to="/leaderboard"
                      className={`drawer-link ${checkItemActive(location, { id: 'leaderboard', to: '/leaderboard' }) ? 'active' : ''}`}
                    >
                      <BarChart3 size={16} />
                      <span>Leaderboard</span>
                      <ChevronRight size={14} className="drawer-arrow" />
                    </Link>
                  </div>

                  {/* 👤 PLAYER */}
                  <div className="drawer-group">
                    <span className="drawer-group-title">👤 PLAYER</span>
                    <Link
                      to="/profile"
                      className={`drawer-link ${checkItemActive(location, { id: 'profile', to: '/profile' }) ? 'active' : ''}`}
                    >
                      <User size={16} />
                      <span>Profile</span>
                      <ChevronRight size={14} className="drawer-arrow" />
                    </Link>
                    <Link
                      to="/badges"
                      className={`drawer-link ${checkItemActive(location, { id: 'badges', to: '/badges' }) ? 'active' : ''}`}
                    >
                      <Trophy size={16} />
                      <span>Achievements &amp; Badges</span>
                      <ChevronRight size={14} className="drawer-arrow" />
                    </Link>
                    <Link
                      to="/settings"
                      className={`drawer-link ${checkItemActive(location, { id: 'settings', to: '/settings' }) ? 'active' : ''}`}
                    >
                      <Settings size={16} />
                      <span>Crystal Core Settings</span>
                      <ChevronRight size={14} className="drawer-arrow" />
                    </Link>
                    <button
                      type="button"
                      className="drawer-link logout"
                      onClick={signOut}
                    >
                      <LogOut size={16} />
                      <span>Leave Kingdom (Log Out)</span>
                    </button>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ============================================================
            MAIN CONTENT AREA
           ============================================================ */}
        <main className="tv-kingdom-content">{children}</main>

        {/* ============================================================
            CINEMATIC REALM FOOTER
           ============================================================ */}
        <TechVerseFooter />

        {/* ============================================================
            MOBILE BOTTOM HUD QUICK BAR
           ============================================================ */}
        <nav className="kingdom-mobile-bottom-bar" aria-label="Quick mobile navigation">
          {[
            { label: 'Home', to: '/dashboard', icon: House, id: 'dashboard' },
            { label: 'Explore', to: '/explore', icon: Compass, id: 'explore' },
            { label: 'Learn', to: '/learn', icon: BookOpen, id: 'learn' },
            { label: 'Practice', to: '/practice', icon: Code2, id: 'practice' },
            { label: 'Battle', to: '/battle-arena', icon: Swords, id: 'battle-arena' },
            { label: 'Ranks', to: '/leaderboard', icon: BarChart3, id: 'leaderboard' },
          ].map(({ label, to, icon: Icon, id }) => (
            <Link
              key={id}
              to={to}
              className={`mobile-bottom-link ${checkItemActive(location, { id, to }) ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {checkItemActive(location, { id, to }) && <span className="bottom-pip" />}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}