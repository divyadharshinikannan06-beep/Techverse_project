import { motion } from 'framer-motion'
import { CheckCircle2, ChevronRight, RotateCcw, ShieldAlert, Sparkles, Trophy, Zap } from 'lucide-react'

export default function CodingResult({ result, challenge, onRetry, onContinue }) {
  const passed = result.passed
  return (
    <motion.section
      className={`crystal-panel coding-result-panel ${passed ? 'passed' : 'failed'}`}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
    >
      <div className="coding-result-crest">
        {passed ? <Trophy size={32} className="trophy-gem" /> : <ShieldAlert size={32} className="alert-gem" />}
      </div>

      <p className="crystal-eyebrow">
        <span className="spark">✦</span> {passed ? 'CHALLENGE CONQUERED' : 'CHALLENGE REVIEW REQUIRED'} <span className="spark">✦</span>
      </p>

      <h2 className="crystal-title">{passed ? 'ARENA VICTORY' : 'CHECKS NOT PASSED'}</h2>
      <strong className="coding-result-title">{challenge.title}</strong>

      <div className="coding-test-score-box">
        <strong>{result.testsPassed} / {result.totalTests}</strong>
        <span>STATIC CHECKS PASSED</span>
      </div>

      <p className="coding-result-message">{result.message}</p>

      {passed ? (
        <div className="quiz-xp-award-banner">
          <Zap size={22} className="xp-icon" />
          <span>+{result.xpAwarded} CRYSTAL XP</span>
          <small>RECORDED IN CITADEL DATABASE</small>
        </div>
      ) : (
        <p className="coding-no-xp">No XP awarded for this attempt. Refine your logic and try again.</p>
      )}

      <div className="coding-check-list">
        {result.checkResults?.map((check) => (
          <div className={`crystal-panel coding-check-card ${check.passed ? 'passed' : 'failed'}`} key={check.test}>
            <span className="chk-icon">{check.passed ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}</span>
            <span className="chk-desc">Solution structure check {check.test}</span>
            <strong className="chk-status">{check.passed ? 'Passed' : 'Review'}</strong>
          </div>
        ))}
      </div>

      <div className="coding-result-actions">
        {passed ? (
          <button className="crystal-btn crystal-btn-primary large" type="button" onClick={onContinue}>
            <Trophy size={16} /> {result.nextChallengeUnlocked ? 'Continue to Next Arena' : 'Return to Coding Arena'} <ChevronRight size={16} />
          </button>
        ) : (
          <button className="crystal-btn crystal-btn-primary" type="button" onClick={onRetry}>
            <RotateCcw size={16} /> Retry Challenge
          </button>
        )}
      </div>
    </motion.section>
  )
}
