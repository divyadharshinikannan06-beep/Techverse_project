import { useEffect, useState } from 'react'
import { BrainCircuit, CheckCircle2, ChevronRight, Crosshair, Gauge, Sparkles, Target, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AIChatPanel from '../components/AIChatPanel'
import formatLearningTitle from '../utils/formatLearningTitle'

function DomainSignal({ domain }) {
  const isRecommended = domain.domain === domain.recommendedDomain
  return (
    <article className={`adaptive-domain-signal ${isRecommended ? 'recommended' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ color: isRecommended ? 'var(--tv-cyan)' : 'var(--tv-text)' }}>{domain.domain}</strong>
        <span style={{ fontSize: '0.8rem', color: 'var(--tv-muted)' }}>{domain.level} · {domain.assessmentPercentage}% placement</span>
      </div>
      <div className="adaptive-domain-bar" style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', margin: '8px 0', overflow: 'hidden' }}>
        <span style={{
          display: 'block',
          height: '100%',
          width: `${Math.min(100, domain.priorityScore)}%`,
          background: isRecommended ? 'linear-gradient(90deg, #22D3EE, #7B61FF)' : 'var(--tv-cyan)',
          boxShadow: isRecommended ? '0 0 8px rgba(34,211,238,0.5)' : 'none',
          borderRadius: '3px'
        }} />
      </div>
      <small style={{ color: domain.priorityScore > 35 ? 'var(--tv-cyan)' : 'var(--tv-muted)' }}>
        {domain.priorityScore > 35 ? 'Needs focused review' : 'Building steadily'}
      </small>
    </article>
  )
}

export default function AdaptiveLearningPage() {
  const { token } = useAuth()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/adaptive/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load AI recommendations')
        setProfile(data.profile)
      })
      .catch((loadError) => setError(loadError.message || 'AI recommendations are unavailable'))
  }, [token])

  const activity = profile?.recommendedActivity
  const currentTopic = activity?.title || profile?.recommendedDomain || 'computer science'

  return (
    <main className="adaptive-page">
      <div className="adaptive-page-shell" style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <header className="adaptive-page-header crystal-panel" style={{ padding: '24px 28px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <span className="adaptive-oracle-crest" style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(123,97,255,0.25))',
            border: '1px solid rgba(34,211,238,0.3)',
            color: 'var(--tv-cyan)',
            boxShadow: '0 0 20px rgba(34,211,238,0.2)'
          }}>
            <BrainCircuit size={28} />
          </span>
          <div style={{ flex: 1 }}>
            <p className="panel-kicker" style={{ color: 'var(--tv-cyan)', margin: 0 }}>🧙 ORACLE SANCTUM · AI WIZARD TOWER</p>
            <h1 style={{ fontSize: '2rem', letterSpacing: '0.04em', margin: '4px 0' }}>AI LAB</h1>
            <p style={{ color: 'var(--tv-muted)', margin: 0, fontSize: '0.92rem' }}>
              Your Personal Tech Mentor &amp; Code Oracle for engineering mastery across the realms.
            </p>
          </div>
          <div className="crystal-badge" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--tv-cyan)', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.3)' }}>
            <Sparkles size={14} /> GEMINI AI LAB
          </div>
        </header>

        {/* AI Chat Interactive Chamber */}
        <div style={{ marginBottom: '32px' }}>
          <AIChatPanel token={token} currentTopic={currentTopic} />
        </div>

        {error && <div className="module-error" role="alert">{error}</div>}

        {!profile && !error && (
          <div className="crystal-state-box" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div className="hero-spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--tv-cyan)', margin: 0 }}>Consulting Oracle telemetry…</p>
          </div>
        )}

        {profile && (
          <>
            {/* Recommended Skill Panel */}
            <section
              className="crystal-panel"
              style={{
                padding: '32px',
                marginBottom: '28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap',
                background: 'linear-gradient(135deg, rgba(14,21,38,0.95) 0%, rgba(20,16,42,0.95) 100%)',
                border: '1px solid rgba(34,211,238,0.35)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.4), inset 0 0 24px rgba(34,211,238,0.05)'
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <p className="panel-kicker" style={{ color: 'var(--tv-cyan)' }}>NEXT RECOMMENDED SKILL</p>
                <h2 style={{ fontSize: '1.6rem', color: '#fff', margin: '6px 0 10px' }}>
                  {activity?.title ? formatLearningTitle(activity.title) : 'No recommendation available'}
                </h2>
                <p style={{ color: '#CBD5E1', fontSize: '0.95rem', margin: '0 0 12px', lineHeight: 1.6 }}>
                  {profile.recommendation || 'Recommendation detail not available.'}
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--tv-muted)', fontSize: '0.85rem', margin: '0 0 20px' }}>
                  <Target size={15} style={{ color: 'var(--tv-violet)' }} />
                  {profile.reason || 'Personalized context not available.'}
                </p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', fontSize: '0.85rem' }}>
                  <span className="crystal-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={13} /> {profile.difficulty || 'Normal'}
                  </span>
                  <span className="crystal-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Crosshair size={13} /> {profile.recommendedDomain || 'Core Domain'}
                  </span>
                  <span className="crystal-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Gauge size={13} /> {profile.confidence ? `${profile.confidence}% confidence` : 'Citadel Verified'}
                  </span>
                </div>
                {activity ? (
                  <Link className="crystal-btn primary" to={activity.route} style={{ display: 'inline-flex' }}>
                    Start Quest <ChevronRight size={16} />
                  </Link>
                ) : (
                  <Link className="crystal-btn primary" to="/dashboard" style={{ display: 'inline-flex' }}>
                    Citadel Dashboard <ChevronRight size={16} />
                  </Link>
                )}
              </div>

              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, rgba(123,97,255,0.08) 70%)',
                border: '1px solid rgba(34,211,238,0.3)',
                boxShadow: '0 0 30px rgba(34,211,238,0.25)',
                color: 'var(--tv-cyan)'
              }}>
                <BrainCircuit size={52} />
              </div>
            </section>

            {/* Stat Telemetry Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <div className="crystal-panel" style={{ padding: '18px 20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--tv-muted)', textTransform: 'uppercase' }}>Strongest Domain</span>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--tv-cyan)', marginTop: '4px' }}>
                  {profile.strongestDomain || 'Not available'}
                </strong>
              </div>
              <div className="crystal-panel" style={{ padding: '18px 20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--tv-muted)', textTransform: 'uppercase' }}>Focus Domain</span>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--tv-violet)', marginTop: '4px' }}>
                  {profile.weakestDomain || 'Not available'}
                </strong>
              </div>
              <div className="crystal-panel" style={{ padding: '18px 20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--tv-muted)', textTransform: 'uppercase' }}>Current Streak</span>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: '#FB923C', marginTop: '4px' }}>
                  {profile.streak?.currentStreak ?? 0} {profile.streak ? 'days' : ''}
                </strong>
              </div>
              <div className="crystal-panel" style={{ padding: '18px 20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--tv-muted)', textTransform: 'uppercase' }}>Total Experience</span>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--tv-text)', marginTop: '4px' }}>
                  {profile.summary?.totalXP?.toLocaleString?.() ?? '0'} XP
                </strong>
              </div>
            </div>

            {/* Signals & Study Plan */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              <section className="crystal-panel" style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <p className="panel-kicker" style={{ color: 'var(--tv-cyan)' }}>PERFORMANCE INSIGHTS</p>
                    <h2 style={{ fontSize: '1.3rem', margin: '2px 0 0' }}>Skill Signals</h2>
                  </div>
                  <Crosshair size={20} style={{ color: 'var(--tv-cyan)' }} />
                </div>
                <div className="adaptive-domain-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {profile.domains.map((domain) => (
                    <DomainSignal domain={domain} key={domain.domain} />
                  ))}
                </div>
              </section>

              <section className="crystal-panel" style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <p className="panel-kicker" style={{ color: 'var(--tv-cyan)' }}>PERSONALIZED PLAN</p>
                    <h2 style={{ fontSize: '1.3rem', margin: '2px 0 0' }}>Focus Areas</h2>
                  </div>
                  <CheckCircle2 size={20} style={{ color: 'var(--tv-violet)' }} />
                </div>
                <div className="adaptive-focus-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {profile.focusAreas.map((focus) => (
                    <div key={focus} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#E2E8F0' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--tv-cyan)', flexShrink: 0 }} />
                      {focus}
                    </div>
                  ))}
                </div>
                {profile.studyPlan?.steps?.map((step, idx) => (
                  <p key={step} style={{ fontSize: '0.85rem', color: 'var(--tv-muted)', margin: '6px 0', borderLeft: '2px solid rgba(123,97,255,0.4)', paddingLeft: '12px' }}>
                    <strong style={{ color: 'var(--tv-violet)' }}>Step {idx + 1}:</strong> {step}
                  </p>
                ))}
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
