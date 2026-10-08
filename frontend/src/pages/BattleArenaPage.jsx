import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cloud,
  Code2,
  Compass,
  Crown,
  Database,
  Flame,
  History,
  LockKeyhole,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  GlassCard,
  NeonButton,
  PageHeader,
  StatCard,
  CrystalBadge,
  BattleCard,
  LoadingSkeleton,
  ErrorState,
  EmptyState,
} from '../components/ui'

const DOMAINS = [
  'Artificial Intelligence',
  'Web Development',
  'Cloud Computing',
  'Cybersecurity',
  'Data Science',
]

export default function BattleArenaPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()

  // Arena Data States
  const [battles, setBattles] = useState([])
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState({
    totalBattles: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    arenaXP: 0,
  })
  const [rank, setRank] = useState('#1')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Practice Duel Selectors
  const [practiceDomain, setPracticeDomain] = useState('Artificial Intelligence')
  const [practiceDifficulty, setPracticeDifficulty] = useState('Beginner')

  // Daily Challenge Countdown Timer
  const [timeUntilReset, setTimeUntilReset] = useState('')

  // Active In-Arena Battle Flow Modal
  const [activeBattleModal, setActiveBattleModal] = useState(null)
  const [sessionData, setSessionData] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [playerHp, setPlayerHp] = useState(100)
  const [enemyHp, setEnemyHp] = useState(100)
  const [selectedOption, setSelectedOption] = useState(null)
  const [answerFeedback, setAnswerFeedback] = useState(null)
  const [battleSubmitting, setBattleSubmitting] = useState(false)
  const [battleFinished, setBattleFinished] = useState(false)
  const [battleResult, setBattleResult] = useState(null)
  const [questionTimer, setQuestionTimer] = useState(30)
  const [battleStartTime, setBattleStartTime] = useState(null)
  const [battleElapsedTime, setBattleElapsedTime] = useState('00:00')

  // Calculate daily timer countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight - now

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / 1000 / 60) % 60)
      const seconds = Math.floor((diff / 1000) % 60)
      setTimeUntilReset(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      )
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

  // Load Battles, Stats, History, and Leaderboard
  const loadArenaData = () => {
    if (!token) return
    setLoading(true)
    setError('')

    Promise.all([
      fetch('/api/battle', { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
        r.ok ? r.json() : { battles: [] }
      ),
      fetch('/api/battle/history', { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
        r.ok ? r.json() : { history: [] }
      ),
      fetch('/api/battle/stats', { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch('/api/leaderboard?limit=1', { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([battleData, historyData, statsData, lbData]) => {
        setBattles(battleData.battles || [])
        setHistory(historyData.history || [])

        if (statsData?.stats) {
          setStats(statsData.stats)
        } else {
          // Compute client-side fallback from history
          const h = historyData.history || []
          const wins = h.filter((x) => x.status === 'victory').length
          const losses = h.filter((x) => x.status === 'defeat').length
          const total = wins + losses
          const winRate = total > 0 ? Math.round((wins / total) * 100) : 0
          const arenaXP = h
            .filter((x) => x.status === 'victory')
            .reduce((acc, x) => acc + (x.xpEarned || 100), 0)
          setStats({ totalBattles: total, wins, losses, winRate, arenaXP })
        }

        if (lbData?.currentUser?.rank) {
          setRank(`#${lbData.currentUser.rank}`)
        }
      })
      .catch((err) => {
        setError(err.message || 'Unable to connect to Battle Arena')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadArenaData()
  }, [token])

  // Quick Battle Pick (Random unlocked or first battle)
  const quickBattle = useMemo(() => {
    const unlocked = battles.filter((b) => b.status === 'unlocked')
    if (unlocked.length > 0) {
      return unlocked[Math.floor(Math.random() * unlocked.length)]
    }
    return battles[0] || null
  }, [battles])

  // Daily Challenge Pick (Stable pick for the day)
  const dailyChallenge = useMemo(() => {
    if (!battles.length) return null
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    const index = dayOfYear % battles.length
    return battles[index] || battles[0]
  }, [battles])

  // Practice duel target match
  const matchedPracticeBattle = useMemo(() => {
    return (
      battles.find(
        (b) =>
          b.domain?.toLowerCase() === practiceDomain.toLowerCase() &&
          b.difficulty?.toLowerCase() === practiceDifficulty.toLowerCase()
      ) ||
      battles.find((b) => b.domain?.toLowerCase() === practiceDomain.toLowerCase()) ||
      quickBattle
    )
  }, [battles, practiceDomain, practiceDifficulty, quickBattle])

  // Question countdown timer during active duel
  useEffect(() => {
    if (!activeBattleModal || battleFinished || !sessionData) return

    const timer = setInterval(() => {
      setQuestionTimer((prev) => {
        if (prev <= 1) {
          // Timeout counts as incorrect answer
          handleAnswerSubmit(-1)
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [activeBattleModal, battleFinished, sessionData, currentQuestion])

  // Start Interactive Battle Flow
  const launchBattle = async (battle) => {
    if (!battle) return
    setError('')
    setActiveBattleModal(battle)
    setSessionData(null)
    setCurrentQuestion(null)
    setPlayerHp(100)
    setEnemyHp(100)
    setSelectedOption(null)
    setAnswerFeedback(null)
    setBattleFinished(false)
    setBattleResult(null)
    setQuestionTimer(30)
    setBattleStartTime(Date.now())

    try {
      const response = await fetch('/api/battle/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ battleId: battle.id }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to enter battle')

      setSessionData(data)
      setCurrentQuestion(data.question)
      setPlayerHp(data.playerHp || 100)
      setEnemyHp(data.enemyHp || 100)
    } catch (err) {
      setError(err.message || 'Failed to initialize battle duel')
      setActiveBattleModal(null)
    }
  }

  // Answer Submit
  const handleAnswerSubmit = async (answerIndex) => {
    if (!sessionData || !currentQuestion || battleSubmitting || answerFeedback) return

    setBattleSubmitting(true)
    setSelectedOption(answerIndex)

    try {
      const response = await fetch('/api/battle/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          questionId: currentQuestion.questionId,
          answer: answerIndex >= 0 ? answerIndex : 0, // Fallback if timed out
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Error recording answer')

      setPlayerHp(data.playerHp)
      setEnemyHp(data.enemyHp)
      setAnswerFeedback({
        correct: Boolean(data.correct),
        battleFinished: Boolean(data.battleFinished),
        result: data.result,
        nextQuestion: data.nextQuestion,
      })

      if (data.battleFinished) {
        // Complete battle and request reward
        setTimeout(() => {
          finalizeBattle(sessionData.sessionId)
        }, 1200)
      }
    } catch (err) {
      setError(err.message || 'Conduit lost during duel')
    } finally {
      setBattleSubmitting(false)
    }
  }

  // Next Question
  const nextQuestion = () => {
    if (!answerFeedback) return
    setCurrentQuestion(answerFeedback.nextQuestion)
    setSelectedOption(null)
    setAnswerFeedback(null)
    setQuestionTimer(30)
  }

  // Finalize Battle and Award XP
  const finalizeBattle = async (sessionId) => {
    try {
      const response = await fetch('/api/battle/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Error finishing battle')

      const elapsed = Math.round((Date.now() - battleStartTime) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60
      setBattleElapsedTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)

      setBattleResult(data)
      setBattleFinished(true)
      // Reload stats and history in background
      loadArenaData()
    } catch (err) {
      setError(err.message || 'Error finalizing battle reward')
    }
  }

  return (
    <main className="battle-arena-page">
      <div className="tv-cosmic-bg" aria-hidden="true">
        <div className="tv-cosmic-stars" />
      </div>

      <div className="battle-arena-shell">
        {/* Header */}
        <header className="battle-arena-header">
          <div className="battle-arena-crest">
            <Swords size={28} className="swords-gem" />
          </div>
          <div>
            <p className="crystal-eyebrow">
              <span className="spark">✦</span> COMPETITIVE COMBAT REALM <span className="spark">✦</span>
            </p>
            <h1 className="crystal-title">
              BATTLE <span className="highlight">ARENA</span>
            </h1>
            <p className="crystal-subtitle">
              Challenge your skills. Defeat opponents. Earn XP.
            </p>
          </div>

          <div className="arena-pulse crystal-panel">
            <span className="live-dot" /> Live Duels Active
          </div>
        </header>

        {/* Hero Section */}
        <section className="arena-hero-banner">
          <div className="arena-hero-copy">
            <span className="crystal-chip gold small">⚔️ BATTLE ARENA</span>
            <h1>Compete in technical challenges and climb kingdom rankings</h1>
            <p>
              Face off against realm guardians and technical rivals. Answer rapid questions under the countdown timer to deal damage, defend your health, and earn Crystal XP.
            </p>
          </div>

          {quickBattle && (
            <NeonButton
              variant="primary"
              size="lg"
              icon={Swords}
              onClick={() => launchBattle(quickBattle)}
            >
              Enter Quick Battle
            </NeonButton>
          )}
        </section>

        {/* Arena Status Panel */}
        <section className="arena-status-strip" aria-label="Arena Player Status">
          <div className="arena-status-tile">
            <small>CURRENT RANK</small>
            <strong className="gold-glow">{rank}</strong>
          </div>
          <div className="arena-status-tile">
            <small>BATTLE WINS</small>
            <strong className="cyan-glow">{stats.wins}</strong>
          </div>
          <div className="arena-status-tile">
            <small>BATTLE LOSSES</small>
            <strong>{stats.losses}</strong>
          </div>
          <div className="arena-status-tile">
            <small>WIN RATE</small>
            <strong className="emerald-glow">{stats.winRate}%</strong>
          </div>
          <div className="arena-status-tile">
            <small>ARENA XP</small>
            <strong className="gold-glow">+{stats.arenaXP.toLocaleString()}</strong>
          </div>
        </section>

        {/* Error Notice */}
        {error && (
          <ErrorState
            title="ARENA CONDUIT ERROR"
            message={error}
            onRetry={loadArenaData}
          />
        )}

        {/* Main 4 Cards Section */}
        <section className="arena-quad-grid">
          {/* 1. QUICK BATTLE CARD */}
          <GlassCard glow="cyan" className="arena-mode-card">
            <div className="arena-mode-card-head">
              <span className="arena-mode-icon-crest">
                <Zap size={22} color="#22D3EE" />
              </span>
              <CrystalBadge tone="cyan" size="sm">
                INSTANT MATCH
              </CrystalBadge>
            </div>
            <div>
              <h3>1. QUICK BATTLE</h3>
              <p>Jump directly into a random technical challenge calibrated to your skill tier.</p>
            </div>
            <div className="battle-card-meta">
              <span>
                <BrainCircuit size={14} /> {quickBattle?.domain || 'General Tech'}
              </span>
              <span>
                <Shield size={14} /> {quickBattle?.difficulty || 'Intermediate'}
              </span>
              <span className="reward-tag">
                <Zap size={14} /> +{quickBattle?.xpReward || 100} XP
              </span>
            </div>
            <NeonButton
              variant="cyan"
              icon={Play}
              onClick={() => launchBattle(quickBattle)}
              disabled={!quickBattle}
            >
              Start Battle
            </NeonButton>
          </GlassCard>

          {/* 2. DAILY CHALLENGE CARD */}
          <GlassCard glow="gold" className="arena-mode-card">
            <div className="arena-mode-card-head">
              <span className="arena-mode-icon-crest">
                <Flame size={22} color="#F59E0B" />
              </span>
              <span className="battle-timer-chip">
                <Clock size={13} /> {timeUntilReset || '24:00:00'}
              </span>
            </div>
            <div>
              <h3>2. DAILY CHALLENGE</h3>
              <p>Today&apos;s special trial with bonus XP multiplier. Resets every 24 hours.</p>
            </div>
            <div className="battle-card-meta">
              <span>
                <Crown size={14} /> {dailyChallenge?.title || 'Daily Domain Trial'}
              </span>
              <span>
                <Shield size={14} /> {dailyChallenge?.difficulty || 'Advanced'}
              </span>
              <span className="reward-tag">
                <Zap size={14} /> +{(dailyChallenge?.xpReward || 100) + 50} XP Bonus
              </span>
            </div>
            <NeonButton
              variant="primary"
              icon={Play}
              onClick={() => launchBattle(dailyChallenge)}
              disabled={!dailyChallenge}
            >
              Start Daily Challenge
            </NeonButton>
          </GlassCard>

          {/* 3. PRACTICE DUEL CARD */}
          <GlassCard glow="violet" className="arena-mode-card">
            <div className="arena-mode-card-head">
              <span className="arena-mode-icon-crest">
                <Swords size={22} color="#A855F7" />
              </span>
              <CrystalBadge tone="violet" size="sm">
                CUSTOM DUEL
              </CrystalBadge>
            </div>
            <div>
              <h3>3. PRACTICE DUEL</h3>
              <p>Hone your edge by choosing your exact domain discipline and target difficulty.</p>
            </div>

            <div className="settings-form-grid" style={{ gap: '0.8rem' }}>
              <div className="settings-field">
                <label style={{ fontSize: '0.72rem' }}>Domain</label>
                <select
                  className="crystal-select"
                  value={practiceDomain}
                  onChange={(e) => setPracticeDomain(e.target.value)}
                  style={{ padding: '0.6rem 0.8rem', fontSize: '0.82rem' }}
                >
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="settings-field">
                <label style={{ fontSize: '0.72rem' }}>Difficulty</label>
                <select
                  className="crystal-select"
                  value={practiceDifficulty}
                  onChange={(e) => setPracticeDifficulty(e.target.value)}
                  style={{ padding: '0.6rem 0.8rem', fontSize: '0.82rem' }}
                >
                  <option value="Beginner">Beginner (100 XP)</option>
                  <option value="Intermediate">Intermediate (125 XP)</option>
                  <option value="Advanced">Advanced (150 XP)</option>
                </select>
              </div>
            </div>

            <NeonButton
              variant="secondary"
              icon={Play}
              onClick={() => launchBattle(matchedPracticeBattle)}
            >
              Start Practice
            </NeonButton>
          </GlassCard>

          {/* 4. BATTLE HISTORY CARD */}
          <GlassCard glow="none" className="arena-mode-card">
            <div className="arena-mode-card-head">
              <span className="arena-mode-icon-crest">
                <History size={22} color="#CBD5E1" />
              </span>
              <CrystalBadge tone="cyan" size="sm">
                {history.length} DUELS
              </CrystalBadge>
            </div>
            <div>
              <h3>4. BATTLE HISTORY</h3>
              <p>Recent arena encounters, scores, and XP yields logged in the citadel scrolls.</p>
            </div>

            <div className="arena-history-list">
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#8E9AB0', fontSize: '0.85rem' }}>
                  No battle records yet. Enter a battle to forge your history!
                </div>
              ) : (
                history.slice(0, 5).map((item) => {
                  const isWin = item.status === 'victory'
                  return (
                    <div key={item.id} className="arena-history-item">
                      <div className="arena-history-left">
                        {isWin ? (
                          <CheckCircle2 size={16} color="#10B981" />
                        ) : (
                          <XCircle size={16} color="#EF4444" />
                        )}
                        <div className="arena-history-title-wrap">
                          <strong>{item.title}</strong>
                          <small>{item.domain} · {item.score}</small>
                        </div>
                      </div>

                      <div className="arena-history-right">
                        <span className={`crystal-chip small ${isWin ? 'emerald' : 'ruby'}`}>
                          {isWin ? 'VICTORY' : 'DEFEAT'}
                        </span>
                        <b style={{ color: isWin ? '#F59E0B' : '#8E9AB0', fontSize: '0.8rem' }}>
                          +{item.xpEarned} XP
                        </b>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </GlassCard>
        </section>

        {/* All Available Realm Battles Section */}
        <section style={{ marginTop: '2.5rem' }}>
          <div className="crystal-section-header">
            <p className="crystal-eyebrow">
              <span className="spark">✦</span> REALM GUARDIANS &amp; BATTLES <span className="spark">✦</span>
            </p>
            <h2 className="crystal-title" style={{ fontSize: '1.8rem' }}>
              All Arena Challenges
            </h2>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div className="battle-card-grid">
              {battles.map((battle, index) => (
                <BattleCard
                  key={battle.id}
                  battle={battle}
                  index={index}
                  onChallenge={(b) => launchBattle(b)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ============================================================
            ACTIVE IN-ARENA BATTLE MODAL & CHALLENGE SCREEN (Requirement 6)
           ============================================================ */}
        <AnimatePresence>
          {activeBattleModal && (
            <div className="crystal-modal-overlay">
              <motion.div
                className="crystal-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !battleSubmitting && setActiveBattleModal(null)}
              />

              <motion.div
                className="crystal-modal-dialog crystal-panel"
                style={{ maxWidth: '820px' }}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
              >
                {/* Modal Top Bar */}
                <div className="crystal-modal-header">
                  <div>
                    <span className="crystal-chip cyan small">
                      {activeBattleModal.domain} · LEVEL {activeBattleModal.difficulty.toUpperCase()}
                    </span>
                    <h2 className="crystal-modal-title" style={{ marginTop: '0.3rem' }}>
                      {activeBattleModal.title || `${activeBattleModal.domain} Duel`}
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="crystal-modal-close"
                    onClick={() => setActiveBattleModal(null)}
                    disabled={battleSubmitting}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Challenge Screen / In-Progress Duel */}
                {!battleFinished && currentQuestion && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                    {/* Health Bars & Timer Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600 }}>Your Health</span>
                          <span style={{ color: '#10B981', fontWeight: 700 }}>{playerHp}%</span>
                        </div>
                        <div className="crystal-progress-track" style={{ height: '10px' }}>
                          <div
                            className="crystal-progress-fill"
                            style={{
                              width: `${playerHp}%`,
                              background: 'linear-gradient(90deg, #10B981, #34D399)',
                            }}
                          />
                        </div>
                      </div>

                      {/* Timer Display */}
                      <span className={`battle-timer-chip ${questionTimer <= 8 ? 'urgent' : ''}`}>
                        <Clock size={15} /> {questionTimer}s
                      </span>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600 }}>Guardian Health</span>
                          <span style={{ color: '#EF4444', fontWeight: 700 }}>{enemyHp}%</span>
                        </div>
                        <div className="crystal-progress-track" style={{ height: '10px' }}>
                          <div
                            className="crystal-progress-fill"
                            style={{
                              width: `${enemyHp}%`,
                              background: 'linear-gradient(90deg, #EF4444, #F87171)',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Question Card */}
                    <div
                      style={{
                        padding: '1.5rem',
                        background: 'rgba(10, 15, 30, 0.8)',
                        border: '1px solid var(--tv-border)',
                        borderRadius: '16px',
                      }}
                    >
                      <span className="crystal-chip cyan small" style={{ marginBottom: '0.8rem' }}>
                        QUESTION {(sessionData?.questionIndex || 0) + 1} OF {sessionData?.totalQuestions || 5}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', margin: '0 0 1.2rem', color: '#ffffff', lineHeight: 1.5 }}>
                        {currentQuestion.question}
                      </h3>

                      {/* Multiple Choice Options */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                        {currentQuestion.options?.map((opt, idx) => {
                          const isSelected = selectedOption === idx
                          const isCorrect = answerFeedback?.correct && isSelected
                          const isWrong = answerFeedback && !answerFeedback.correct && isSelected

                          let borderStyle = '1px solid var(--tv-border)'
                          let bgStyle = 'rgba(18, 24, 43, 0.6)'
                          if (isSelected && !answerFeedback) {
                            borderStyle = '1px solid var(--tv-cyan)'
                            bgStyle = 'rgba(34, 211, 238, 0.15)'
                          } else if (isCorrect) {
                            borderStyle = '1px solid #10B981'
                            bgStyle = 'rgba(16, 185, 129, 0.2)'
                          } else if (isWrong) {
                            borderStyle = '1px solid #EF4444'
                            bgStyle = 'rgba(239, 68, 68, 0.2)'
                          }

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAnswerSubmit(idx)}
                              disabled={battleSubmitting || Boolean(answerFeedback)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.9rem',
                                padding: '0.9rem 1.1rem',
                                borderRadius: '12px',
                                border: borderStyle,
                                background: bgStyle,
                                color: '#ffffff',
                                textAlign: 'left',
                                cursor: answerFeedback ? 'default' : 'pointer',
                                transition: 'all 0.2s',
                              }}
                            >
                              <span
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.8rem',
                                  color: 'var(--tv-cyan)',
                                }}
                              >
                                {['A', 'B', 'C', 'D'][idx]}
                              </span>
                              <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                            </button>
                          )
                        })}
                      </div>

                      {/* Answer Feedback Alert */}
                      {answerFeedback && (
                        <div
                          style={{
                            marginTop: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.8rem 1rem',
                            borderRadius: '10px',
                            background: answerFeedback.correct
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                            border: answerFeedback.correct
                              ? '1px solid rgba(16, 185, 129, 0.4)'
                              : '1px solid rgba(239, 68, 68, 0.4)',
                          }}
                        >
                          <span
                            style={{
                              color: answerFeedback.correct ? '#10B981' : '#EF4444',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                            }}
                          >
                            {answerFeedback.correct
                              ? '⚔️ Direct Hit! Guardian took damage.'
                              : '🛡️ Glancing blow! Guardian deflected your strike.'}
                          </span>

                          {!answerFeedback.battleFinished && (
                            <NeonButton variant="primary" size="sm" onClick={nextQuestion}>
                              Next Question <ChevronRight size={14} />
                            </NeonButton>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ============================================================
                    RESULT SCREEN (Requirement 6: VICTORY or TRY AGAIN)
                   ============================================================ */}
                {battleFinished && battleResult && (
                  <div className="battle-result-card">
                    <div
                      className={`battle-result-icon-lg ${
                        battleResult.victory ? 'victory' : 'defeat'
                      }`}
                    >
                      {battleResult.victory ? (
                        <Trophy size={36} color="#10B981" />
                      ) : (
                        <RotateCcw size={36} color="#EF4444" />
                      )}
                    </div>

                    <h2
                      style={{
                        fontSize: '2.4rem',
                        fontWeight: 800,
                        margin: 0,
                        color: battleResult.victory ? '#10B981' : '#EF4444',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {battleResult.victory ? 'VICTORY' : 'TRY AGAIN'}
                    </h2>

                    <p style={{ color: '#CBD5E1', fontSize: '1rem', margin: 0 }}>
                      {battleResult.message}
                    </p>

                    <div className="battle-result-stats-row">
                      <div className="battle-stat-col">
                        <strong>
                          {battleResult.correctAnswers} / {battleResult.totalQuestions}
                        </strong>
                        <small>Score</small>
                      </div>

                      <div className="battle-stat-col">
                        <strong style={{ color: '#10B981' }}>
                          {battleResult.correctAnswers} Correct
                        </strong>
                        <small>Accuracy</small>
                      </div>

                      <div className="battle-stat-col">
                        <strong style={{ color: '#F59E0B' }}>
                          +{battleResult.xpAwarded} XP
                        </strong>
                        <small>XP Earned</small>
                      </div>

                      <div className="battle-stat-col">
                        <strong>{battleElapsedTime}</strong>
                        <small>Time Taken</small>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <NeonButton
                        variant="secondary"
                        onClick={() => {
                          setActiveBattleModal(null)
                          setBattleResult(null)
                        }}
                      >
                        Return to Arena
                      </NeonButton>

                      {quickBattle && (
                        <NeonButton
                          variant="primary"
                          onClick={() => {
                            launchBattle(quickBattle)
                          }}
                        >
                          Next Battle <ChevronRight size={15} />
                        </NeonButton>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
