import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ChevronRight, ShieldAlert } from 'lucide-react'

export default function BattleQuestion({ question, index, total, feedback, submitting, onAnswer, onContinue }) {
  return (
    <section className="battle-question-panel tech-panel">
      <div className="battle-question-top"><p className="panel-kicker">QUESTION {String(index + 1).padStart(2, '0')}</p><span>{index + 1} / {total}</span></div>
      <AnimatePresence mode="wait"><motion.div key={question.questionId} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: .16 }}>
        <h2>{question.question}</h2>
        <div className="battle-answer-list">{question.options.map((option, optionIndex) => <button className="battle-answer" type="button" key={`${question.questionId}-${optionIndex}`} disabled={submitting || Boolean(feedback)} onClick={() => onAnswer(optionIndex)}><span>{String.fromCharCode(65 + optionIndex)}</span><strong>{option}</strong></button>)}</div>
      </motion.div></AnimatePresence>
      {feedback && <motion.div className={`battle-answer-feedback ${feedback.correct ? 'correct' : 'incorrect'}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{feedback.correct ? <CheckCircle2 size={17} /> : <ShieldAlert size={17} />}<span>{feedback.correct ? 'Correct answer. Opponent health decreased.' : 'Incorrect answer. Your remaining health decreased.'}</span></motion.div>}
      {feedback && feedback.battleFinished && <button type="button" className="primary-button battle-continue-button" disabled={submitting} onClick={onContinue}>{submitting ? 'Saving result…' : 'View battle result'} <ChevronRight size={16} /></button>}
      {feedback && !feedback.battleFinished && <button type="button" className="primary-button battle-continue-button" disabled={submitting} onClick={onContinue}>Continue <ChevronRight size={16} /></button>}
    </section>
  )
}
