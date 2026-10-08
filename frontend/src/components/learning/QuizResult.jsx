import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, RotateCcw, ShieldAlert, Sparkles, Trophy, Zap } from 'lucide-react'
import formatLearningTitle from '../../utils/formatLearningTitle'

export default function QuizResult({
  module,
  questions,
  result,
  codingChallengeId,
  onReview,
  onRetry,
  onCodingQuest,
  onContinue,
}) {
  const passed = result.passed
  const questionById = new Map(questions.map((q) => [q.id, q]))

  return (
    <motion.section
      className={`crystal-panel quiz-result-panel ${passed ? 'passed' : 'failed'}`}
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
    >
      <div className="quiz-result-crest">
        {passed ? <Trophy size={32} className="trophy-gem" /> : <ShieldAlert size={32} className="alert-gem" />}
      </div>

      <p className="crystal-eyebrow">
        <span className="spark">✦</span> {passed ? 'TRIAL PASSED' : 'TRIAL INCOMPLETE'} <span className="spark">✦</span>
      </p>

      <h1 className="crystal-title">
        {passed ? 'SPIRE QUEST CONQUERED' : 'TRIAL REQUIRES REVISION'}
      </h1>

      <p className="quiz-result-module">{formatLearningTitle(module.title)}</p>

      <div className="quiz-score-chamber">
        <div className="quiz-score-display">
          <strong>{result.score}<span> / {result.totalQuestions}</span></strong>
          <small>ACCURACY {result.percentage}% · PASS CRITERIA 70%</small>
        </div>

        {passed ? (
          <div className="quiz-xp-award-banner">
            <Zap size={22} className="xp-icon" />
            <span>+{result.xpAwarded} CRYSTAL XP</span>
            <small>AWARDED BY KINGDOM ORACLE</small>
          </div>
        ) : (
          <p className="quiz-retry-copy">
            Review the manuscript and attempt the trial once more. No XP was awarded for this attempt.
          </p>
        )}
      </div>

      {/* Answer Review */}
      <div className="quiz-explanations">
        <h2>
          <Sparkles size={17} /> Trial Answer Audit
        </h2>
        {result.explanations.map((entry, index) => {
          const q = questionById.get(entry.questionId)
          return (
            <article
              className={`crystal-panel quiz-explanation ${entry.isCorrect ? 'correct' : 'incorrect'}`}
              key={entry.questionId}
            >
              <div className="explanation-heading">
                <span>
                  {entry.isCorrect ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />} Question {index + 1}
                </span>
                <strong className={entry.isCorrect ? 'status-correct' : 'status-review'}>
                  {entry.isCorrect ? '✓ Correct' : '✕ Review'}
                </strong>
              </div>
              <p className="explanation-question-text">{q?.question}</p>
              <div className="explanation-answers-meta">
                <small>Your selection: <b>{q?.options[entry.submittedAnswer] || 'None'}</b></small>
                {!entry.isCorrect && (
                  <small className="correct-answer-reveal">
                    Attuned answer: <b>{q?.options[entry.correctAnswer]}</b>
                  </small>
                )}
              </div>
              <p className="explanation-copy">{entry.explanation}</p>
            </article>
          )
        })}
      </div>

      {/* Bottom Actions */}
      <div className="quiz-result-actions">
        {passed ? (
          <>
            {codingChallengeId && (
              <button
                className="crystal-btn crystal-btn-secondary"
                type="button"
                onClick={() => onCodingQuest(codingChallengeId)}
              >
                <Zap size={16} /> Enter Coding Arena
              </button>
            )}
            <button className="crystal-btn crystal-btn-primary large" type="button" onClick={onContinue}>
              <Trophy size={16} /> Return to Citadel
            </button>
          </>
        ) : (
          <>
            <button className="crystal-btn crystal-btn-secondary" type="button" onClick={onReview}>
              <ArrowLeft size={16} /> Review Manuscript
            </button>
            <button className="crystal-btn crystal-btn-primary" type="button" onClick={onRetry}>
              <RotateCcw size={16} /> Retake Trial
            </button>
          </>
        )}
      </div>
    </motion.section>
  )
}
