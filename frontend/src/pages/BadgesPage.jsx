import { useEffect, useState } from 'react'
import { Award, Gem, Sparkles, Lock, CheckCircle2, Shield, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BadgeCard from '../components/BadgeCard'

export default function BadgesPage() {
  const { token } = useAuth()
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'earned' | 'locked'

  useEffect(() => {
    fetch('/api/badges', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load crystal relics')
        setBadges(data.badges || [])
      })
      .catch((loadError) => setError(loadError.message || 'Unable to load crystal relics'))
      .finally(() => setLoading(false))
  }, [token])

  const earnedCount = badges.filter((badge) => badge.earned).length
  const lockedCount = badges.length - earnedCount

  const filteredBadges = badges.filter((b) => {
    if (filter === 'earned') return b.earned
    if (filter === 'locked') return !b.earned
    return true
  })

  return (
    <main className="social-page">
      <div className="social-page-shell">
        <header className="social-page-header crystal-panel" style={{ padding: '24px 28px', marginBottom: '28px' }}>
          <span className="social-page-crest" style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(123,97,255,0.25))', border: '1px solid rgba(34,211,238,0.3)', color: 'var(--tv-cyan)' }}>
            <Gem size={28} />
          </span>
          <div>
            <p className="panel-kicker" style={{ color: 'var(--tv-cyan)' }}>ANCIENT TECH CITADEL ARCHIVES</p>
            <h1 style={{ fontSize: '2rem', letterSpacing: '0.04em', margin: '4px 0 6px' }}>CRYSTAL RELICS</h1>
            <p style={{ color: 'var(--tv-muted)', margin: 0 }}>
              Sacred technology artifacts forged from your achievements across the realms.
            </p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="crystal-badge" style={{ padding: '8px 16px', fontSize: '0.9rem', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.3)', color: 'var(--tv-cyan)' }}>
              <strong>{earnedCount}</strong> / {badges.length} Unlocked
            </div>
          </div>
        </header>

        {error && <div className="module-error" role="alert">{error}</div>}

        {/* Filter controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`crystal-btn ${filter === 'all' ? 'primary' : 'ghost'}`}
              style={{ padding: '7px 16px', fontSize: '0.8rem' }}
            >
              All Relics ({badges.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('earned')}
              className={`crystal-btn ${filter === 'earned' ? 'primary' : 'ghost'}`}
              style={{ padding: '7px 16px', fontSize: '0.8rem' }}
            >
              Attained ({earnedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('locked')}
              className={`crystal-btn ${filter === 'locked' ? 'primary' : 'ghost'}`}
              style={{ padding: '7px 16px', fontSize: '0.8rem' }}
            >
              In Quest ({lockedCount})
            </button>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--tv-muted)' }}>
            Each relic pulses with elemental technology energy
          </span>
        </div>

        {loading ? (
          <div className="crystal-state-box" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div className="hero-spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--tv-cyan)', margin: 0 }}>Communing with the Citadel Archives…</p>
          </div>
        ) : filteredBadges.length === 0 ? (
          <div className="crystal-state-box" style={{ padding: '64px 32px', textAlign: 'center' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, rgba(123,97,255,0.05) 70%)',
              border: '1px solid rgba(34,211,238,0.3)',
              color: 'var(--tv-cyan)'
            }}>
              <Sparkles size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--tv-text)', marginBottom: '8px' }}>Your first relic awaits.</h2>
            <p style={{ color: 'var(--tv-muted)', maxWidth: '440px', margin: '0 auto 24px', fontSize: '0.9rem' }}>
              Conquer module trials, write battle-ready code in the Arena, and ascend the Citadel Leaderboard to crystallize your first permanent achievement relic.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/worlds" className="crystal-btn primary">
                <Compass size={16} /> Explore Realms
              </Link>
              <Link to="/coding" className="crystal-btn secondary">
                <Shield size={16} /> Enter Arena
              </Link>
            </div>
          </div>
        ) : (
          <div className="badge-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {filteredBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
