import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Code2, Lightbulb, Play, RotateCcw, Send, ShieldAlert, Sparkles, Trophy, Zap } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CodingEditor from '../components/coding/CodingEditor'
import CodingResult from '../components/coding/CodingResult'

export default function CodingChallengePage() {
  const { challengeId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [challenge, setChallenge] = useState(null)
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [runResult, setRunResult] = useState(null)
  const [submitResult, setSubmitResult] = useState(null)
  const [visibleHints, setVisibleHints] = useState(0)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      setSubmitResult(null)
      try {
        const response = await fetch(`/api/coding/${encodeURIComponent(challengeId)}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to open this coding challenge')
        if (data.challenge.status === 'locked') throw new Error('This challenge is locked. Complete its prerequisite module first.')
        if (data.challenge.status === 'completed') throw new Error('Challenge already completed.')
        if (!active) return
        setChallenge(data.challenge)
        setLanguage(data.challenge.supportedLanguages[0])
        setCode(data.challenge.starterCode[data.challenge.supportedLanguages[0]] || '')
        setRunResult(null)
        setVisibleHints(0)
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to load this coding challenge')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [challengeId, token])

  const languageLabel = useMemo(() => language === 'python' ? 'Python' : 'JavaScript', [language])

  const runCode = async () => {
    setRunning(true)
    setError('')
    try {
      const response = await fetch('/api/coding/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ challengeId, language, code }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to check this solution')
      setRunResult(data)
    } catch (runError) {
      setError(runError.message || 'Run checks failed. Check your connection and try again.')
    } finally {
      setRunning(false)
    }
  }

  const submitCode = async () => {
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/coding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ challengeId, language, code }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to submit this coding challenge')
      setSubmitResult(data)
    } catch (submitError) {
      setError(submitError.message || 'Submission failed. Check your connection and retry.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="coding-page">
        <div className="tv-cosmic-bg" aria-hidden="true"><div className="tv-cosmic-stars" /></div>
        <div className="crystal-state-box" role="status">
          <div className="crystal-loading-spinner" />
          <h3 className="crystal-state-title">ENTERING THE CRYSTAL REALM...</h3>
          <p className="crystal-state-desc">Loading coding arena workspace.</p>
        </div>
      </main>
    )
  }

  if (submitResult) {
    return (
      <main className="coding-page">
        <div className="tv-cosmic-bg" aria-hidden="true"><div className="tv-cosmic-stars" /></div>
        <div className="coding-page-shell">
          <CodingResult
            result={submitResult}
            challenge={challenge}
            onRetry={() => setSubmitResult(null)}
            onContinue={() => navigate('/coding')}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="coding-page">
      <div className="tv-cosmic-bg" aria-hidden="true"><div className="tv-cosmic-stars" /></div>

      <div className="coding-page-shell coding-arena-shell">
        {/* Arena Top Navigation */}
        <div className="coding-nav-bar">
          <button
            className="crystal-btn crystal-btn-secondary small"
            type="button"
            onClick={() => navigate('/coding')}
          >
            <ArrowLeft size={15} /> Return to Coding Arena
          </button>

          {challenge && (
            <span className="crystal-chip cyan">
              <Sparkles size={12} /> {challenge.domain} · {challenge.difficulty} · +{challenge.xp} XP
            </span>
          )}
        </div>

        {error && (
          <div className="crystal-state-box error" role="alert">
            <h3 className="crystal-state-title">ARENA NOTICE</h3>
            <p className="crystal-state-desc">{error}</p>
          </div>
        )}

        {challenge && (
          <>
            {/* Arena Header */}
            <header className="coding-challenge-header">
              <div className="coding-header-crest">
                <Code2 size={24} className="code-gem" />
              </div>
              <div className="coding-header-copy">
                <p className="crystal-eyebrow">
                  <span className="spark">✦</span> CODING ARENA <span className="spark">✦</span>
                </p>
                <h1 className="crystal-title">{challenge.title}</h1>
                <p className="coding-module-breadcrumb">
                  Domain: {challenge.domain} · Module: {challenge.requiredModuleTitle || challenge.moduleId.replaceAll('-', ' ')}
                </p>
              </div>
            </header>

            {/* 3-Column Arena Layout: LEFT (Problem), CENTER (Code Editor), RIGHT (Test Cases & Results) */}
            <div className="coding-arena-tri-layout">
              {/* LEFT COLUMN: Problem / Quest Description */}
              <section className="crystal-panel arena-col-problem">
                <div className="arena-panel-head">
                  <p className="crystal-eyebrow">
                    <span className="spark">✦</span> QUEST SPECIFICATION
                  </p>
                  <h2>Problem Statement</h2>
                </div>

                <p className="coding-problem-description">{challenge.description}</p>

                <div className="coding-io-block crystal-panel">
                  <strong>Expected Input</strong>
                  <p>{challenge.inputDescription}</p>
                  <strong>Expected Output</strong>
                  <p>{challenge.outputDescription}</p>
                </div>

                <div className="coding-constraints-block">
                  <h3>Constraints</h3>
                  <ul>
                    {challenge.constraints.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="coding-examples-block">
                  <h3>Examples</h3>
                  {challenge.examples.map((ex, i) => (
                    <div className="coding-example crystal-panel" key={`${ex.input}-${i}`}>
                      <span className="ex-tag">Example {i + 1}</span>
                      <code>Input: {ex.input}</code>
                      <code>Output: {ex.output}</code>
                    </div>
                  ))}
                </div>

                <div className="coding-hints-block">
                  <h3>
                    <Lightbulb size={15} /> Oracle Hints
                  </h3>
                  {challenge.hints.slice(0, visibleHints).map((h, i) => (
                    <p className="coding-hint crystal-panel" key={h}>
                      Hint {i + 1}: {h}
                    </p>
                  ))}
                  {visibleHints < challenge.hints.length && (
                    <button
                      type="button"
                      className="crystal-btn crystal-btn-secondary small"
                      onClick={() => setVisibleHints((c) => c + 1)}
                    >
                      <Sparkles size={13} /> Reveal Hint {visibleHints + 1}
                    </button>
                  )}
                </div>
              </section>

              {/* CENTER COLUMN: Code Editor with subtle crystal frame */}
              <section className="arena-col-editor">
                <CodingEditor
                  language={language}
                  onLanguageChange={(nextLang) => {
                    setLanguage(nextLang)
                    setCode(challenge.starterCode[nextLang] || '')
                    setRunResult(null)
                  }}
                  code={code}
                  onCodeChange={(nextCode) => {
                    setCode(nextCode)
                    setRunResult(null)
                  }}
                  starterCode={challenge.starterCode[language]}
                />

                <p className="coding-editor-footnote">
                  Safe static validation: code structures are inspected against challenge rules. Supported: Python 3 &amp; JavaScript.
                </p>
              </section>

              {/* RIGHT COLUMN: Test Cases, Run Results & Actions */}
              <section className="crystal-panel arena-col-tests">
                <div className="arena-panel-head">
                  <p className="crystal-eyebrow">
                    <span className="spark">✦</span> TEST CHAMBER
                  </p>
                  <h2>Static Validation</h2>
                </div>

                <div className="arena-actions-box">
                  <button
                    type="button"
                    className="crystal-btn crystal-btn-secondary w-full"
                    onClick={runCode}
                    disabled={!code.trim() || running || submitting}
                  >
                    <Play size={15} /> {running ? 'Checking...' : 'RUN CODE'}
                  </button>

                  <button
                    type="button"
                    className="crystal-btn crystal-btn-primary w-full"
                    onClick={submitCode}
                    disabled={!code.trim() || running || submitting}
                  >
                    <Zap size={15} /> {submitting ? 'Validating...' : 'SUBMIT SOLUTION'}
                  </button>

                  <button
                    type="button"
                    className="crystal-btn crystal-btn-ghost small w-full"
                    onClick={() => setCode(challenge.starterCode[language])}
                    disabled={running || submitting}
                  >
                    <RotateCcw size={13} /> RESET
                  </button>
                </div>

                {/* Live Run Checks Output */}
                <div className="arena-results-chamber">
                  {runResult ? (
                    <motion.div
                      className="run-results-wrap"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="run-results-summary">
                        <strong>Test Status</strong>
                        <span className={`crystal-chip small ${runResult.testsPassed === runResult.totalTests ? 'emerald' : 'gold'}`}>
                          {runResult.testsPassed} / {runResult.totalTests} Passed
                        </span>
                      </div>

                      <div className="run-checks-list">
                        {runResult.checkResults?.map((chk) => (
                          <div
                            key={chk.test}
                            className={`run-check-item ${chk.passed ? 'passed' : 'failed'}`}
                          >
                            <span>{chk.passed ? '✓' : '✕'}</span>
                            <small>Check {chk.test}</small>
                            <strong>{chk.passed ? 'Passed' : 'Review'}</strong>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="tests-idle-state">
                      <Sparkles size={24} className="idle-spark" />
                      <p>Run code to inspect static structure checks before submitting.</p>
                    </div>
                  )}
                </div>

                <div className="arena-reward-display">
                  <span className="reward-label">QUEST REWARD:</span>
                  <span className="reward-val">+{challenge.xp} Crystal XP</span>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
