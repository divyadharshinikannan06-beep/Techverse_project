import { useEffect, useState } from 'react'
import { Award, Flame, Gem, UserRound, Trophy, Zap, Shield, Sparkles, BookOpen, Clock, Settings, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BadgeCard from '../components/BadgeCard'

export default function ProfilePage() {
  const { token, user } = useAuth()
  const [progress, setProgress] = useState(null)
  const [badges, setBadges] = useState([])
  const [streak, setStreak] = useState(null)
  const [rank, setRank] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/progress/me', { headers: { Authorization: `Bearer ${token}` } }).then(async (response) => (response.ok ? response.json() : null)),
      fetch('/api/badges', { headers: { Authorization: `Bearer ${token}` } }).then(async (response) => (response.ok ? response.json() : null)),
      fetch('/api/streak', { headers: { Authorization: `Bearer ${token}` } }).then(async (response) => (response.ok ? response.json() : null)),
      fetch('/api/leaderboard', { headers: { Authorization: `Bearer ${token}` } }).then(async (response) => (response.ok ? response.json() : null)),
    ])
      .then(([progressData, badgeData, streakData, leaderboardData]) => {
        setProgress(progressData?.progress || null)
        setBadges(badgeData?.badges || [])
        setStreak(streakData?.streak || null)
        setRank(leaderboardData?.currentUser || null)
      })
      .catch(() => setError('Unable to synchronize profile data with the Citadel'))
      .finally(() => setLoading(false))
  }, [token])

  const earnedBadges = badges.filter((badge) => badge.earned)
  const userLevel = user?.level || rank?.level || progress?.level || 1
  const userXP = (progress?.totalXP ?? rank?.xp ?? 0)
  const completedCount = progress?.completedModules?.length || 0

  return (
    <main className="social-page">
      <div className="social-page-shell" style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* Page Title Header */}
        <header style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p className="panel-kicker" style={{ color: 'var(--tv-cyan)' }}>CITADEL IDENTITY RECORD</p>
            <h1 style={{ fontSize: '2.2rem', letterSpacing: '0.04em', margin: '4px 0' }}>YOUR TECHVERSE PROFILE</h1>
            <p style={{ color: 'var(--tv-muted)', margin: 0, fontSize: '0.95rem' }}>
              Your character dossier, celestial rank, and permanent tech mastery archive.
            </p>
          </div>
          <Link to="/settings" className="crystal-btn ghost" style={{ gap: '8px' }}>
            <Settings size={16} /> Citadel Core Settings
          </Link>
        </header>

        {error && <div className="module-error" role="alert">{error}</div>}

        {/* LARGE CRYSTAL PROFILE HERO FRAME */}
        <section
          className="crystal-panel profile-crystal-hero"
          style={{
            position: 'relative',
            padding: '36px',
            marginBottom: '32px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(14,21,38,0.92) 0%, rgba(20,16,42,0.95) 100%)',
            border: '1px solid rgba(34,211,238,0.3)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5), inset 0 0 30px rgba(34,211,238,0.06)'
          }}
        >
          {/* Subtle cosmic energy background glow */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '240px',
              height: '240px',
              background: 'radial-gradient(circle, rgba(123,97,255,0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
              filter: 'blur(20px)'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-40px',
              left: '10%',
              width: '260px',
              height: '180px',
              background: 'radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
              filter: 'blur(25px)'
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            {/* Character Avatar with Crystal Frame & Hexagonal / Orbital Aura */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(123,97,255,0.3) 100%)',
                  border: '2px solid rgba(34,211,238,0.5)',
                  boxShadow: '0 0 25px rgba(34,211,238,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.name || 'Character'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserRound size={52} style={{ color: 'var(--tv-cyan)' }} />
                )}
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '-10px',
                  right: '-10px',
                  background: 'linear-gradient(135deg, #22D3EE, #7B61FF)',
                  color: '#070B14',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  boxShadow: '0 0 12px rgba(34,211,238,0.6)',
                  letterSpacing: '0.05em'
                }}
              >
                LVL {userLevel}
              </div>
            </div>

            {/* Character Identity & Titles */}
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span className="crystal-badge" style={{ fontSize: '0.75rem', background: 'rgba(34,211,238,0.1)', color: 'var(--tv-cyan)', border: '1px solid rgba(34,211,238,0.3)' }}>
                  CITADEL EXPLORER
                </span>
                {rank?.rank && rank.rank <= 10 && (
                  <span className="crystal-badge" style={{ fontSize: '0.75rem', background: 'rgba(251,191,36,0.15)', color: '#FCD34D', border: '1px solid rgba(251,191,36,0.4)' }}>
                    TOP {rank.rank} REALM CHAMPION
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: '2rem', margin: '4px 0 6px', fontWeight: 700, color: '#fff' }}>
                {user?.name || 'TechVerse Traveler'}
              </h2>
              <p style={{ color: 'var(--tv-muted)', margin: '0 0 12px', fontSize: '0.9rem' }}>
                {user?.email || 'Authenticated Realm Citizen'}
              </p>

              {/* Status summary */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: '#94A3B8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} style={{ color: 'var(--tv-cyan)' }} /> Realm Tier: <strong>Novice Architect</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} style={{ color: 'var(--tv-violet)' }} /> Status: <strong style={{ color: '#10B981' }}>Active Explorer</strong>
                </span>
              </div>
            </div>

            {/* Quick Action Pedestal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'center' }}>
              <Link to="/worlds" className="crystal-btn primary" style={{ minWidth: '160px', justifyContent: 'center' }}>
                <Compass size={16} /> Resume Quest
              </Link>
              <Link to="/badges" className="crystal-btn ghost" style={{ minWidth: '160px', justifyContent: 'center' }}>
                <Gem size={16} /> View All Relics
              </Link>
            </div>
          </div>
        </section>

        {/* REAL BACKEND STATISTICS CARDS */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.25rem', letterSpacing: '0.04em', color: 'var(--tv-text)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} style={{ color: 'var(--tv-cyan)' }} /> CITADEL MASTERY TELEMETRY
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Total XP */}
            <div className="crystal-panel" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--tv-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Experience</span>
                <span style={{ color: 'var(--tv-cyan)', background: 'rgba(34,211,238,0.1)', padding: '6px', borderRadius: '8px' }}><Zap size={18} /></span>
              </div>
              <strong style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--tv-cyan)' }}>
                {userXP.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--tv-muted)' }}>XP</span>
              </strong>
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--tv-muted)' }}>
                Verified by Citadel Ledger
              </div>
            </div>

            {/* Leaderboard Rank */}
            <div className="crystal-panel" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--tv-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Leaderboard Rank</span>
                <span style={{ color: '#FCD34D', background: 'rgba(251,191,36,0.1)', padding: '6px', borderRadius: '8px' }}><Trophy size={18} /></span>
              </div>
              <strong style={{ fontSize: '1.8rem', fontWeight: 800, color: rank?.rank ? '#FCD34D' : 'var(--tv-text)' }}>
                {rank?.rank ? `#${rank.rank}` : 'Unranked'}
              </strong>
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--tv-muted)' }}>
                Among Champions of TechVerse
              </div>
            </div>

            {/* Crystal Relics Earned */}
            <div className="crystal-panel" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--tv-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Relics Unlocked</span>
                <span style={{ color: 'var(--tv-violet)', background: 'rgba(123,97,255,0.15)', padding: '6px', borderRadius: '8px' }}><Award size={18} /></span>
              </div>
              <strong style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--tv-violet)' }}>
                {earnedBadges.length} <span style={{ fontSize: '0.9rem', color: 'var(--tv-muted)' }}>/ {badges.length || '—'}</span>
              </strong>
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--tv-muted)' }}>
                Forged technology milestones
              </div>
            </div>

            {/* Quest Streak */}
            <div className="crystal-panel" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--tv-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current Streak</span>
                <span style={{ color: '#F97316', background: 'rgba(249,115,22,0.1)', padding: '6px', borderRadius: '8px' }}><Flame size={18} /></span>
              </div>
              <strong style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FB923C' }}>
                {streak?.currentStreak ?? 0} <span style={{ fontSize: '0.9rem', color: 'var(--tv-muted)' }}>Days</span>
              </strong>
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--tv-muted)' }}>
                Best: {streak?.longestStreak ?? 0} consecutive days
              </div>
            </div>
          </div>
        </section>

        {/* EARNED RELICS SECTION */}
        <section className="crystal-panel" style={{ padding: '28px 32px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p className="panel-kicker" style={{ color: 'var(--tv-cyan)' }}>REALM ARTIFACTS</p>
              <h2 style={{ fontSize: '1.5rem', margin: '2px 0 0' }}>Attained Crystal Relics</h2>
            </div>
            <Link to="/badges" className="crystal-btn ghost" style={{ fontSize: '0.85rem' }}>
              View All Relics →
            </Link>
          </div>

          {earnedBadges.length === 0 ? (
            <div className="crystal-state-box" style={{ padding: '40px 24px', textAlign: 'center' }}>
              <Sparkles size={32} style={{ color: 'var(--tv-cyan)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 6px' }}>Your first relic awaits.</h3>
              <p style={{ color: 'var(--tv-muted)', fontSize: '0.85rem', margin: '0 0 16px' }}>
                Complete technology modules or arena battles to display your earned artifacts here.
              </p>
              <Link to="/worlds" className="crystal-btn primary">
                Embark on Quests
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
              {earnedBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
