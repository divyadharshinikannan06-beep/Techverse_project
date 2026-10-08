import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleDot,
  Compass,
  LockKeyhole,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import QuizMission from '../components/learning/QuizMission'
import QuizResult from '../components/learning/QuizResult'
import { getQuizQuestions } from '../data/quizQuestions'
import { lessonContent } from '../data/lessonContent'
import { codingChallengeCatalog } from '../data/codingChallenges'
import formatLearningTitle from '../utils/formatLearningTitle'
import { parseJsonResponse } from '../utils/api'

function buildLessonSteps(lesson) {
  return [
    { id: 'intro', title: 'Introduction', type: 'text', content: lesson.introduction },
    ...lesson.sections.map((section, index) => ({ id: `section-${index}`, title: section.title, type: 'text', content: section.content })),
    { id: 'key-points', title: 'Key points', type: 'list', items: lesson.keyPoints },
    { id: 'example', title: lesson.example.title, type: 'example', content: lesson.example.description },
    { id: 'practice', title: 'Practice scenario', type: 'mission', content: lesson.mission.description },
  ]
}

const questNodes = [
  { id: 'start', label: 'START' },
  { id: 'foundation', label: 'FOUNDATION CRYSTAL' },
  { id: 'core', label: 'CORE SKILLS' },
  { id: 'practice', label: 'PRACTICE REALM' },
  { id: 'advanced', label: 'ADVANCED REALM' },
  { id: 'mastery', label: 'MASTERY CITADEL' },
]

export default function ModuleLearningPage() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useAuth()
  const [module, setModule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lockReason, setLockReason] = useState('')
  const [error, setError] = useState('')
  const [quizError, setQuizError] = useState('')
  const [submittingQuiz, setSubmittingQuiz] = useState(false)
  const [view, setView] = useState('lesson')
  const [sectionIndex, setSectionIndex] = useState(0)
  const [quizResult, setQuizResult] = useState(null)

  useEffect(() => {
    let active = true
    async function loadModule() {
      setLoading(true)
      setError('')
      setLockReason('')
      setQuizError('')
      setQuizResult(null)
      setView(new URLSearchParams(location.search).get('view') === 'quiz' ? 'quiz' : 'lesson')
      setSectionIndex(0)
      try {
        const response = await fetch('/api/learning/path', { headers: { Authorization: `Bearer ${token}` } })
        const data = await parseJsonResponse(response)
        if (!response.ok) throw new Error(data?.message || 'Unable to load your learning path')
        const path = data?.learningPath?.paths?.find((item) => item.modules.some((candidate) => candidate.id === moduleId))
        const selected = path?.modules.find((candidate) => candidate.id === moduleId)
        if (!selected || !lessonContent[moduleId]) throw new Error('This learning module could not be found')
        if (!active) return
        setModule(selected)
        if (selected.status === 'locked') {
          setLockReason(selected.lockedReason || 'Complete the prerequisite module first.')
          return
        }
        if (selected.status === 'completed') {
          setLockReason(selected.assessmentCredit
            ? 'Your assessment credits this foundation module as complete; no additional XP is available.'
            : 'This module is already complete. Your earned XP is saved.')
          return
        }
        const startResponse = await fetch('/api/progress/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ moduleId }),
        })
        const startData = await parseJsonResponse(startResponse)
        if (!startResponse.ok) throw new Error(startData?.message || 'This module is not available yet')
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to load this module')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadModule()
    return () => { active = false }
  }, [moduleId, token, location.search])

  const submitQuiz = async (answers) => {
    setSubmittingQuiz(true)
    setQuizError('')
    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ moduleId, answers }),
      })
      const data = await parseJsonResponse(response)
      if (!response.ok) throw new Error(data?.message || 'Unable to evaluate this quiz')
      setQuizResult(data)
      setView('result')
    } catch (submitError) {
      setQuizError(submitError.message || 'Quiz submission failed. Check your connection and retry.')
    } finally {
      setSubmittingQuiz(false)
    }
  }

  if (loading) {
    return (
      <main className="module-learning-page">
        <div className="tv-cosmic-bg" aria-hidden="true"><div className="tv-cosmic-stars" /></div>
        <div className="crystal-state-box">
          <div className="crystal-loading-spinner" />
          <h3 className="crystal-state-title">ENTERING THE CRYSTAL REALM...</h3>
          <p className="crystal-state-desc">Accessing spire manuscripts and sanctum archives.</p>
        </div>
      </main>
    )
  }

  const lesson = module ? lessonContent[module.id] : null
  const steps = lesson ? buildLessonSteps(lesson) : []
  const questions = getQuizQuestions(moduleId)
  const activeStep = steps[sectionIndex]
  const lessonProgress = steps.length ? Math.round(((sectionIndex + 1) / steps.length) * 100) : 0

  // Calculate current node index
  const activeNodeIndex = Math.min(
    questNodes.length - 1,
    Math.max(1, Math.floor((sectionIndex / (steps.length || 1)) * (questNodes.length - 2)) + 1)
  )

  return (
    <main className="module-learning-page">
      <div className="tv-cosmic-bg" aria-hidden="true"><div className="tv-cosmic-stars" /></div>

      <div className="module-learning-shell">
        {/* Navigation Bar */}
        <div className="module-nav-bar">
          <button
            className="crystal-btn crystal-btn-secondary small"
            type="button"
            onClick={() => navigate('/worlds')}
          >
            <ArrowLeft size={15} /> Return to Technology Realms
          </button>

          {module && (
            <span className="crystal-chip cyan">
              <Sparkles size={12} /> {module.domain} · Level {lesson?.level || 'Core'}
            </span>
          )}
        </div>

        {error && (
          <div className="crystal-state-box error" role="alert">
            <h3 className="crystal-state-title">SPIRE ERROR</h3>
            <p className="crystal-state-desc">{error}</p>
          </div>
        )}

        {/* Locked Module View */}
        {lockReason ? (
          <motion.section
            className="crystal-panel module-locked-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="module-locked-icon">
              <LockKeyhole size={28} />
            </div>
            <p className="crystal-eyebrow">
              <span className="spark">✦</span> MODULE STATUS <span className="spark">✦</span>
            </p>
            <h1 className="crystal-title">{formatLearningTitle(module?.title || 'Learning module')}</h1>
            <p className="crystal-state-desc">{lockReason}</p>
            <button
              type="button"
              className="crystal-btn crystal-btn-primary"
              onClick={() => navigate('/worlds')}
            >
              Return to Technology Realms
            </button>
          </motion.section>
        ) : module && lesson && view === 'lesson' && (
          <motion.section
            className="crystal-panel module-learning-panel"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Quest Visual Header */}
            <div className="module-world-header">
              <div className="module-world-crystal">
                <BookOpen size={26} />
              </div>
              <div className="module-world-titles">
                <p className="crystal-eyebrow">
                  <span className="spark">✦</span> YOUR LEARNING JOURNEY
                </p>
                <h1 className="crystal-title">{formatLearningTitle(lesson.title)}</h1>
                <p className="module-intro-text">{lesson.introduction}</p>
              </div>
            </div>

            {/* RPG Quest Nodes Flow */}
            <div className="quest-nodes-container" aria-label="Quest Progression">
              <div className="quest-nodes-track">
                {questNodes.map((node, idx) => {
                  const isCurrent = idx === activeNodeIndex
                  const isPassed = idx < activeNodeIndex
                  return (
                    <div key={node.id} className={`quest-node-item ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}>
                      <span className="quest-node-gem">
                        {isPassed ? <CheckCircle2 size={13} /> : <CircleDot size={13} />}
                      </span>
                      <span className="quest-node-label">{node.label}</span>
                      {idx < questNodes.length - 1 && <span className="quest-node-line" />}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Stat Strip */}
            <div className="module-stat-strip">
              <span>
                <small>TIER</small>
                <strong>{lesson.level}</strong>
              </span>
              <span>
                <small>EST. DURATION</small>
                <strong>{lesson.estimatedTime}</strong>
              </span>
              <span>
                <small>XP REWARD</small>
                <strong className="reward-xp">+{module.xp} XP</strong>
              </span>
              <span>
                <small>PROGRESS</small>
                <strong>{lessonProgress}%</strong>
              </span>
            </div>

            {/* Section Progress Bar */}
            <div className="lesson-crystal-progress">
              <div
                className="quiz-crystal-track"
                role="progressbar"
                aria-label="Lesson progress"
                aria-valuenow={sectionIndex + 1}
                aria-valuemin={1}
                aria-valuemax={steps.length}
              >
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    className={`step-pip ${index < sectionIndex ? 'complete' : ''} ${index === sectionIndex ? 'active' : ''}`}
                    type="button"
                    aria-label={`Go to section ${index + 1}: ${step.title}`}
                    onClick={() => setSectionIndex(index)}
                  />
                ))}
              </div>
            </div>

            {/* Layout: Sidebar Navigation + Main Content */}
            <div className="lesson-layout">
              <nav className="lesson-section-nav" aria-label="Lesson sections">
                <p className="panel-kicker">QUEST SCROLL</p>
                {steps.map((step, index) => (
                  <button
                    type="button"
                    key={step.id}
                    className={`lesson-nav-btn ${index === sectionIndex ? 'active' : ''}`}
                    onClick={() => setSectionIndex(index)}
                  >
                    <span>
                      {index < sectionIndex ? <CheckCircle2 size={14} className="check-icon" /> : <BookOpen size={14} />}
                    </span>
                    <span className="btn-label">{step.title}</span>
                  </button>
                ))}
              </nav>

              <AnimatePresence mode="wait">
                <motion.article
                  className="lesson-current-section crystal-panel"
                  key={activeStep.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <p className="crystal-eyebrow">
                    <span className="spark">✦</span> {module.domain} · SECTION {String(sectionIndex + 1).padStart(2, '0')}
                  </p>
                  <h2 className="section-step-title">{activeStep.title}</h2>

                  {activeStep.type === 'text' && <p className="lesson-paragraph">{activeStep.content}</p>}

                  {activeStep.type === 'list' && (
                    <ul className="lesson-key-points">
                      {activeStep.items.map((item) => (
                        <li key={item}>
                          <Sparkles size={16} className="point-sparkle" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {activeStep.type === 'example' && (
                    <div className="lesson-example crystal-panel">
                      <span className="lesson-example-icon">
                        <BookOpen size={18} />
                      </span>
                      <div>
                        <strong>{lesson.example.title}</strong>
                        <p>{activeStep.content}</p>
                      </div>
                    </div>
                  )}

                  {activeStep.type === 'mission' && (
                    <div className="lesson-mission-brief crystal-panel">
                      <span className="crystal-eyebrow">
                        <span className="spark">✦</span> PRACTICE SCENARIO
                      </span>
                      <p>{activeStep.content}</p>
                      <small>Review the key points, then enter the Crystal Trial to claim your {module.xp} XP reward.</small>
                    </div>
                  )}

                  {sectionIndex === 0 && (
                    <section className="lesson-objectives">
                      <h3>
                        <Target size={16} /> Spire Objectives
                      </h3>
                      <ul>
                        {lesson.learningObjectives.map((obj) => (
                          <li key={obj}>
                            <CheckCircle2 size={15} />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </motion.article>
              </AnimatePresence>
            </div>

            {/* Bottom Actions */}
            <div className="lesson-navigation">
              <button
                type="button"
                className="crystal-btn crystal-btn-secondary"
                disabled={sectionIndex === 0}
                onClick={() => setSectionIndex((val) => Math.max(0, val - 1))}
              >
                <ArrowLeft size={16} /> Previous
              </button>

              {sectionIndex < steps.length - 1 ? (
                <button
                  type="button"
                  className="crystal-btn crystal-btn-primary"
                  onClick={() => setSectionIndex((val) => val + 1)}
                >
                  Next Section <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="crystal-btn crystal-btn-primary"
                  disabled={questions.length === 0}
                  onClick={() => {
                    setQuizError('')
                    setView('quiz')
                  }}
                >
                  Begin Crystal Trial <Sparkles size={16} />
                </button>
              )}
            </div>

            {questions.length === 0 && (
              <p className="module-error">A trial quiz is not available for this module yet.</p>
            )}
          </motion.section>
        )}

        {/* View: Quiz Mission */}
        {module && view === 'quiz' && (
          <QuizMission
            module={module}
            questions={questions}
            onSubmit={submitQuiz}
            submitting={submittingQuiz}
            error={quizError}
          />
        )}

        {/* View: Quiz Result */}
        {module && view === 'result' && quizResult && (
          <QuizResult
            module={module}
            questions={questions}
            result={quizResult}
            codingChallengeId={codingChallengeCatalog.find((c) => c.moduleId === module.id)?.id}
            onReview={() => {
              setView('lesson')
              setSectionIndex(0)
            }}
            onRetry={() => {
              setQuizResult(null)
              setQuizError('')
              setView('quiz')
            }}
            onCodingQuest={(id) => navigate(`/coding/${id}`)}
            onContinue={() => navigate('/dashboard')}
          />
        )}
      </div>
    </main>
  )
}
