import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, Shield, Sparkles, Target, Trophy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { assessmentQuestions } from '../data/assessmentQuestions'
import { parseJsonResponse } from '../utils/api'

const levelColors = { Beginner: 'beginner', Intermediate: 'intermediate', Advanced: 'advanced' }

function AssessmentResult({ assessment, onContinue }) {
  return (
    <motion.section 
      className="assessment-result placement-card crystal-panel" 
      initial={{ opacity: 0, scale: 0.95, y: 20 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="result-crest">
        <Trophy size={32} className="trophy-gem" />
      </div>

      <p className="crystal-eyebrow">
        <span className="spark">✦</span> ASCENSION EVALUATION <span className="spark">✦</span>
      </p>

      <h1 className="crystal-title">
        TRIAL <span className="highlight">COMPLETE</span>
      </h1>

      <p className="result-intro">
        Your resonant frequencies have been measured. Your personalized kingdom learning path is calibrated.
      </p>

      <div className="result-score-chamber">
        <div className="result-score-gauge">
          <strong>{assessment.overallPercentage}%</strong>
          <span>OVERALL ACCURACY</span>
        </div>
        <p>{assessment.overallScore} / {assessment.overallTotal} questions answered correctly</p>
      </div>

      <div className="result-columns">
        <div className="result-section crystal-panel">
          <div className="result-section-title">
            <Target size={17} />
            <span>Realm Calibrations</span>
          </div>
          <div className="domain-result-grid">
            {assessment.domainResults.map((result) => (
              <div className="domain-result" key={result.domain}>
                <div className="domain-result-heading">
                  <strong>{result.domain}</strong>
                  <span className={`result-level ${levelColors[result.level]}`}>{result.level}</span>
                </div>
                <div className="crystal-progress-track">
                  <div className="crystal-progress-fill" style={{ width: `${result.percentage}%` }} />
                </div>
                <small>{result.score}/{result.total} correct · {result.percentage}%</small>
              </div>
            ))}
          </div>
        </div>

        <div className="result-section recommendation-section crystal-panel">
          <div className="result-section-title">
            <Sparkles size={17} />
            <span>Recommended Exploration Order</span>
          </div>
          <ol className="recommendation-list">
            {assessment.recommendedDomains.map((domain, index) => (
              <li key={domain}>
                <span className="order-num">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{domain}</strong>
                  <small>
                    {assessment.weakestDomains.includes(domain)
                      ? 'Priority focus · build foundational spires'
                      : assessment.strongestDomains.includes(domain)
                      ? 'Strong mastery · advanced quests unlocked'
                      : 'Next realm in progression cycle'}
                  </small>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="result-highlights crystal-panel">
        <div>
          <span className="panel-kicker">STRONGEST REALMS</span>
          <strong>{assessment.strongestDomains.join(' · ')}</strong>
        </div>
        <div>
          <span className="panel-kicker">FOCUS HORIZONS</span>
          <strong>{assessment.weakestDomains.join(' · ')}</strong>
        </div>
      </div>

      <button
        type="button"
        className="crystal-btn crystal-btn-primary large result-cta"
        onClick={onContinue}
      >
        <Sparkles size={17} /> Enter the Crystal Citadel <ArrowRight size={17} />
      </button>
    </motion.section>
  )
}

export default function PlacementTestPage() {
  const navigate = useNavigate()
  const { token, user, markPlacementCompleted } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [assessment, setAssessment] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user?.placementCompleted && !assessment) navigate('/dashboard', { replace: true })
  }, [assessment, navigate, user?.placementCompleted])

  const currentQuestion = assessmentQuestions[currentIndex]
  const progress = ((currentIndex + 1) / assessmentQuestions.length) * 100
  const selectedValue = useMemo(() => answers[currentQuestion.id], [answers, currentQuestion.id])
  const handleSelect = (index) => setAnswers((current) => ({ ...current, [currentQuestion.id]: index }))

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== assessmentQuestions.length) {
      toast.error('Choose an answer for every question before submitting.')
      return
    }
    setSubmitting(true)
    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers: assessmentQuestions.map(({ id }) => ({ questionId: id, selectedIndex: answers[id] })) }),
      })
      const data = await parseJsonResponse(response)
      if (!response.ok) throw new Error(data?.message || 'Unable to complete assessment')
      markPlacementCompleted()
      setAssessment(data?.assessment)
      toast.success('Your personalized learning path is ready!')
    } catch (error) {
      toast.error(error.message || 'Assessment could not be saved')
    } finally {
      setSubmitting(false)
    }
  }

  if (assessment) {
    return (
      <main className="placement-page">
        <div className="tv-cosmic-bg" aria-hidden="true"><div className="tv-cosmic-stars" /></div>
        <div className="placement-shell">
          <AssessmentResult
            assessment={assessment}
            onContinue={() => navigate('/dashboard', { replace: true, state: { assessmentComplete: true } })}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="placement-page assessment-trial">
      <div className="tv-cosmic-bg" aria-hidden="true"><div className="tv-cosmic-stars" /></div>

      <div className="placement-shell">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="placement-card crystal-panel trial-chamber"
        >
          {/* Header */}
          <div className="placement-header">
            <div>
              <p className="crystal-eyebrow">
                <span className="spark">✦</span> THE CRYSTAL TRIAL <span className="spark">✦</span>
              </p>
              <h1 className="crystal-title">Assess Your Engineering Skills</h1>
              <p className="assessment-subtitle">
                Calibrate your knowledge across the five kingdoms to forge a custom curriculum.
              </p>
            </div>
            <div className="question-meta-pill">
              QUESTION {String(currentIndex + 1).padStart(2, '0')} / {String(assessmentQuestions.length).padStart(2, '0')}
            </div>
          </div>

          {/* Progress Bar & Crystal Steps */}
          <div className="crystal-progress-track">
            <div className="crystal-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="crystal-steps-strip" aria-label="Assessment progress">
            {assessmentQuestions.map((q, index) => (
              <span
                key={q.id}
                className={`crystal-step-shard ${index < currentIndex ? 'complete' : ''} ${index === currentIndex ? 'current' : ''}`}
              />
            ))}
          </div>

          {/* Question Chamber */}
          <div className="question-panel">
            <div className="domain-badge-pill">
              <Shield size={13} /> {currentQuestion.domain}
            </div>
            <h2 className="trial-question-title">{currentQuestion.question}</h2>

            <div className="option-list">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  className={`option-card ${selectedValue === index ? 'selected' : ''}`}
                  onClick={() => handleSelect(index)}
                >
                  <span className="option-index">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                  {selectedValue === index && <CheckCircle2 size={18} className="option-check" />}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="placement-actions">
            <button
              type="button"
              className="crystal-btn crystal-btn-secondary"
              onClick={() => setCurrentIndex((val) => Math.max(0, val - 1))}
              disabled={currentIndex === 0}
            >
              <ArrowLeft size={16} /> Previous
            </button>

            {currentIndex < assessmentQuestions.length - 1 ? (
              <button
                type="button"
                className="crystal-btn crystal-btn-primary"
                onClick={() => setCurrentIndex((val) => val + 1)}
                disabled={selectedValue === undefined}
              >
                Continue Trial <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="crystal-btn crystal-btn-primary"
                onClick={handleSubmit}
                disabled={selectedValue === undefined || submitting}
              >
                {submitting ? 'Calibrating Realms…' : 'Complete Trial'} <Sparkles size={16} />
              </button>
            )}
          </div>
        </motion.section>
      </div>
    </main>
  )
}
