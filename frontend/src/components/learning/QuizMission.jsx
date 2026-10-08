import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, ShieldQuestion, Sparkles } from 'lucide-react'
import formatLearningTitle from '../../utils/formatLearningTitle'

export default function QuizMission({ module, questions, onSubmit, submitting, error }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const question = questions[index]
  const selected = answers[question.id]
  const progress = ((index + 1) / questions.length) * 100

  const submit = () => onSubmit(questions.map((item) => ({ questionId: item.id, answer: answers[item.id] })))

  return (
    <motion.section
      className="crystal-panel quiz-mission-panel trial-chamber"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Trial Header */}
      <div className="quiz-trial-header">
        <div className="quiz-crest">
          <ShieldQuestion size={24} className="shield-icon" />
        </div>
        <div className="quiz-header-titles">
          <p className="crystal-eyebrow">
            <span className="spark">✦</span> {module.domain} · LEVEL {module.level || 'CORE'}
          </p>
          <h1 className="crystal-title">CRYSTAL TRIAL</h1>
          <p className="quiz-module-name">{formatLearningTitle(module.title)}</p>
        </div>
        <div className="quiz-counter-pill">
          {index + 1} / {questions.length}
        </div>
      </div>

      {/* Progress Track */}
      <div className="crystal-progress-track">
        <div className="crystal-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="quiz-crystal-track" role="progressbar" aria-label="Trial steps" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={questions.length}>
        {questions.map((item, qIdx) => (
          <span
            key={item.id}
            className={`crystal-step-shard ${qIdx < index ? 'complete' : ''} ${qIdx === index ? 'current' : ''}`}
          />
        ))}
      </div>

      <div className="quiz-progress-copy">
        <span>Trial Calibration</span>
        <strong>{Math.round(progress)}%</strong>
      </div>

      {error && <div className="crystal-state-box error" role="alert"><p>{error}</p></div>}

      {/* Question Chamber Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          className="quiz-question-card crystal-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, type: 'spring' }}
        >
          <div className="question-order-tag">
            <span>QUESTION {String(index + 1).padStart(2, '0')}</span>
            <span className="crystal-chip small cyan">+{module.xp} XP</span>
          </div>

          <h2 className="trial-question-heading">{question.question}</h2>

          <div className="quiz-options">
            {question.options.map((option, optIdx) => (
              <motion.button
                className={`quiz-option ${selected === optIdx ? 'selected' : ''}`}
                type="button"
                key={option}
                aria-pressed={selected === optIdx}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAnswers((curr) => ({ ...curr, [question.id]: optIdx }))}
              >
                <span className="option-letter">{String.fromCharCode(65 + optIdx)}</span>
                <strong className="option-text">{option}</strong>
                {selected === optIdx && <CheckCircle2 size={18} className="option-check" />}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="quiz-navigation">
        <button
          className="crystal-btn crystal-btn-secondary"
          type="button"
          disabled={index === 0 || submitting}
          onClick={() => setIndex((curr) => curr - 1)}
        >
          <ArrowLeft size={16} /> Previous
        </button>

        {index < questions.length - 1 ? (
          <button
            className="crystal-btn crystal-btn-primary"
            type="button"
            disabled={selected === undefined || submitting}
            onClick={() => setIndex((curr) => curr + 1)}
          >
            Next Question <ArrowRight size={16} />
          </button>
        ) : (
          <button
            className="crystal-btn crystal-btn-primary"
            type="button"
            disabled={selected === undefined || submitting || Object.keys(answers).length !== questions.length}
            onClick={submit}
          >
            {submitting ? 'Evaluating Trial…' : 'Submit Trial'} <Sparkles size={16} />
          </button>
        )}
      </div>

      <p className="quiz-reward-note">
        ✦ Achieve 70% accuracy to master this spire and claim its server-validated {module.xp} Crystal XP.
      </p>
    </motion.section>
  )
}
