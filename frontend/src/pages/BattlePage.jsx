import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, BrainCircuit, CheckCircle2, Swords, Zap } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BattleEnemy from '../components/battle/BattleEnemy'
import BattleHealthBar from '../components/battle/BattleHealthBar'
import BattleQuestion from '../components/battle/BattleQuestion'
import BattleResult from '../components/battle/BattleResult'

export default function BattlePage() {
  const { battleId } = useParams()
  const { token } = useAuth()
  const [battle, setBattle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [question, setQuestion] = useState(null)
  const [pendingQuestion, setPendingQuestion] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [playerHp, setPlayerHp] = useState(100)
  const [enemyHp, setEnemyHp] = useState(100)
  const [feedback, setFeedback] = useState(null)
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [result, setResult] = useState(null)
  const [enemyHit, setEnemyHit] = useState(false)

  useEffect(() => {
    let active = true
    async function loadBattle() {
      setLoading(true)
      setError('')
      setResult(null)
      try {
        const response = await fetch(`/api/battle/${encodeURIComponent(battleId)}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to enter this battle')
        if (active) setBattle(data.battle)
      } catch (loadError) {
        if (active) setError(loadError.message || 'Battle Arena is unavailable')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadBattle()
    return () => { active = false }
  }, [battleId, token])

  const startBattle = async () => {
    setError('')
    try {
      const response = await fetch('/api/battle/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ battleId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to start this battle')
      setSessionId(data.sessionId)
      setPlayerHp(data.playerHp)
      setEnemyHp(data.enemyHp)
      setQuestion(data.question)
      setPendingQuestion(null)
      setQuestionIndex(0)
      setFeedback(null)
      setResult(null)
    } catch (startError) {
      setError(startError.message || 'Unable to start battle')
    }
  }

  const submitAnswer = async (answerIndex) => {
    if (!sessionId || !question) return
    setSubmittingAnswer(true)
    setError('')
    try {
      const response = await fetch('/api/battle/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId, questionId: question.questionId, answer: answerIndex }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to record this answer')
      setPlayerHp(data.playerHp)
      setEnemyHp(data.enemyHp)
      setEnemyHit(Boolean(data.correct))
      window.setTimeout(() => setEnemyHit(false), 400)
      setFeedback({ correct: data.correct, battleFinished: data.battleFinished })
      if (data.nextQuestion) setPendingQuestion(data.nextQuestion)
    } catch (answerError) {
      setError(answerError.message || 'Battle connection failed; your answer was not saved')
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const finishBattle = async () => {
    setFinishing(true)
    setError('')
    try {
      const response = await fetch('/api/battle/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to record battle result')
      setResult(data)
    } catch (finishError) {
      setError(finishError.message || 'Unable to finish this battle')
    } finally {
      setFinishing(false)
    }
  }

  if (loading) {
    return (
      <main className="battle-page">
        <div className="tv-cosmic-bg" aria-hidden="true"><div className="tv-cosmic-stars" /></div>
        <div className="crystal-state-box" role="status">
          <div className="crystal-loading-spinner" />
          <h3 className="crystal-state-title">ENTERING THE CRYSTAL REALM...</h3>
          <p className="crystal-state-desc">Loading battle arena sanctum.</p>
        </div>
      </main>
    )
  }

  if (result && battle) {
    return (
      <main className="battle-page">
        <div className="tv-cosmic-bg" aria-hidden="true"><div className="tv-cosmic-stars" /></div>
        <div className="battle-page-shell">
          <BattleResult battle={battle} result={result} onRetry={startBattle} />
        </div>
      </main>
    )
  }

  return (
    <main className="battle-page">
      <div className="tv-cosmic-bg" aria-hidden="true"><div className="tv-cosmic-stars" /></div>

      <div className="battle-page-shell">
        <div className="battle-nav-bar">
          <Link to="/battle" className="crystal-btn crystal-btn-secondary small">
            <ArrowLeft size={15} /> Return to Battle Arena
          </Link>
        </div>

        {error && (
          <div className="crystal-state-box error" role="alert">
            <h3 className="crystal-state-title">ARENA NOTICE</h3>
            <p className="crystal-state-desc">{error}</p>
          </div>
        )}

        {/* Battle Intro View */}
        {battle && !sessionId && (
          <motion.section
            className="crystal-panel battle-intro-panel"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="battle-intro-top">
              <span className="battle-arena-crest">
                <Swords size={26} className="swords-gem" />
              </span>
              <div>
                <p className="crystal-eyebrow">
                  <span className="spark">✦</span> {battle.domain} · LEVEL {battle.difficulty.toUpperCase()}
                </p>
                <h1 className="crystal-title">{battle.domain} Duel</h1>
                <p className="battle-intro-sub">
                  Face {battle.questionCount} technical questions. Earn +{battle.xpReward} Crystal XP upon victory.
                </p>
              </div>
            </div>

            <div className="battle-intro-enemy crystal-panel">
              <div className="battle-enemy-sigil">
                <BrainCircuit size={22} />
              </div>
              <div className="enemy-details">
                <small>CHALLENGE GUARDIAN</small>
                <strong>{battle.domain} Knowledge Nexus</strong>
                <span>{battle.questionCount} Questions · {battle.difficulty} Difficulty</span>
              </div>
              <b className="reward-badge">+{battle.xpReward} XP</b>
            </div>

            <div className="battle-rules-strip">
              <span>✦ Real-time scoring per question</span>
              <span>✦ Correct answers deal damage to the guardian</span>
              <span>✦ Incorrect answers reduce your player health</span>
            </div>

            <button
              className="crystal-btn crystal-btn-primary large battle-start-button"
              type="button"
              onClick={startBattle}
            >
              <CheckCircle2 size={17} /> Begin Arena Duel
            </button>
          </motion.section>
        )}

        {/* Active Combat View */}
        {battle && sessionId && question && (
          <div className="battle-active-stage">
            <header className="battle-active-header crystal-panel">
              <div>
                <p className="crystal-eyebrow">
                  <span className="spark">✦</span> {battle.domain} · CHALLENGE {battle.order}
                </p>
                <h1 className="crystal-title small-title">
                  <BrainCircuit size={20} /> {battle.domain} Duel
                </h1>
              </div>
              <div className="battle-active-counter crystal-chip cyan">
                Question {Math.min(questionIndex + 1, battle.questionCount)} / {battle.questionCount}
              </div>
            </header>

            <div className="battle-health-row">
              <BattleHealthBar label="Your Health" value={playerHp} side="player" />
              <span className="battle-vs-badge">VS</span>
              <BattleHealthBar label="Guardian Health" value={enemyHp} side="enemy" />
            </div>

            <BattleEnemy battle={battle} enemyHp={enemyHp} hit={enemyHit} />

            <BattleQuestion
              question={question}
              index={questionIndex}
              total={battle.questionCount}
              feedback={feedback}
              submitting={submittingAnswer || finishing}
              onAnswer={submitAnswer}
              onContinue={() => {
                if (feedback?.battleFinished) {
                  finishBattle()
                } else {
                  setQuestion(pendingQuestion)
                  setPendingQuestion(null)
                  setQuestionIndex((i) => i + 1)
                  setFeedback(null)
                }
              }}
            />
          </div>
        )}
      </div>
    </main>
  )
}
